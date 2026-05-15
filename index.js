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
const shouldPush = args.includes("--push");
const dryRun = args.includes("--dry-run");

if (!Number.isInteger(count) || count < 1) {
  console.error("Please provide a valid positive number with --count.");
  process.exit(1);
}

const createRandomDate = () => {
  const week = random.int(0, 54);
  const day = random.int(0, 6);

  return moment()
    .subtract(1, "year")
    .add(1, "day")
    .add(week, "weeks")
    .add(day, "days")
    .format();
};

const writeCommit = async (date) => {
  await jsonfile.writeFile(dataFile, { date });
  await git.add([dataFile]);
  await git.commit(date, undefined, { "--date": date });
};

const run = async () => {
  for (let i = 0; i < count; i += 1) {
    const date = createRandomDate();
    console.log(`${dryRun ? "[preview]" : "[commit]"} ${date}`);

    if (!dryRun) {
      await writeCommit(date);
    }
  }

  if (!dryRun && shouldPush) {
    await git.push();
  }

  if (dryRun) {
    console.log(`Previewed ${count} commit date(s).`);
  } else if (shouldPush) {
    console.log(`Created ${count} commit(s) and pushed them.`);
  } else {
    console.log(`Created ${count} local commit(s). Run again with --push when you are ready to publish.`);
  }
};

run().catch((error) => {
  console.error("The script stopped before finishing:");
  console.error(error.message);
  process.exit(1);
});
