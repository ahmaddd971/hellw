import jsonfile from "jsonfile";
import moment from "moment";
import random from "random";
import simpleGit from "simple-git";

const dataFile = "./data.json";
const git = simpleGit();
const args = process.argv.slice(2);

const getArgValue = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const count = Number.parseInt(getArgValue("--count") ?? "100", 10);
const days = Number.parseInt(getArgValue("--days") ?? "365", 10);
const perDay = Number.parseInt(getArgValue("--per-day") ?? "2", 10);
const shouldPush = args.includes("--push");
const dryRun = args.includes("--dry-run");
const fillYear = args.includes("--fill-year");

if (!Number.isInteger(count) || count < 1) {
  console.error("Please provide a valid positive number with --count.");
  process.exit(1);
}

if (!Number.isInteger(days) || days < 1) {
  console.error("Please provide a valid positive number with --days.");
  process.exit(1);
}

if (!Number.isInteger(perDay) || perDay < 1) {
  console.error("Please provide a valid positive number with --per-day.");
  process.exit(1);
}

const createRandomDate = () => {
  const week = random.int(0, 54);
  const day = random.int(0, 6);

  return moment
    .utc()
    .subtract(1, "year")
    .add(1, "day")
    .add(week, "weeks")
    .add(day, "days")
    .hour(12)
    .minute(0)
    .second(0)
    .millisecond(0)
    .format();
};

const createFillDates = () => {
  const dates = [];

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset -= 1) {
    const date = moment
      .utc()
      .startOf("day")
      .subtract(dayOffset, "days")
      .hour(12)
      .minute(0)
      .second(0)
      .millisecond(0);

    for (let sequence = 1; sequence <= perDay; sequence += 1) {
      dates.push({
        date: date.clone().add(sequence, "minutes").format(),
        sequence,
      });
    }
  }

  return dates;
};

const writeCommit = async ({ date, sequence }) => {
  await jsonfile.writeFile(dataFile, { date, sequence });
  await git.add([dataFile]);
  await git.commit(date, undefined, { "--date": date });
};

const createSchedule = () => {
  if (fillYear) {
    return createFillDates();
  }

  return Array.from({ length: count }, (_, index) => ({
    date: createRandomDate(),
    sequence: index + 1,
  }));
};

const run = async () => {
  const schedule = createSchedule();
  const verbose = dryRun || schedule.length <= 100;

  if (fillYear) {
    console.log(
      `${dryRun ? "Previewing" : "Creating"} ${schedule.length} commit(s): ${perDay} per day across ${days} UTC day(s).`,
    );
  }

  for (const [index, item] of schedule.entries()) {
    if (verbose) {
      console.log(`${dryRun ? "[preview]" : "[commit]"} ${item.date}`);
    } else if (fillYear && item.sequence === 1) {
      console.log(`[day ${Math.floor(index / perDay) + 1}/${days}] ${item.date.slice(0, 10)}`);
    }

    if (!dryRun) {
      await writeCommit(item);
    }
  }

  if (!dryRun && shouldPush) {
    await git.push();
  }

  if (dryRun) {
    console.log(`Previewed ${schedule.length} commit date(s).`);
  } else if (shouldPush) {
    console.log(`Created ${schedule.length} commit(s) and pushed them.`);
  } else {
    console.log(
      `Created ${schedule.length} local commit(s). Run again with --push when you are ready to publish.`,
    );
  }
};

run().catch((error) => {
  console.error("The script stopped before finishing:");
  console.error(error.message);
  process.exit(1);
});
