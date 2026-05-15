# 🌱 goGreen

`goGreen` is a small Node.js script that creates commits on chosen past dates so you can experiment with a GitHub contribution graph.

## Quick start

```bash
npm install
npm run preview
```

`npm run preview` shows the dates it would use without changing Git or pushing anything.

## Create commits

Create 10 local commits:

```bash
npm start -- --count 10
```

Create 10 commits and push them to the configured GitHub remote:

```bash
npm start -- --count 10 --push
```

Fill the last 365 UTC days with 10 commits per day:

```bash
npm run fill-year
```

Fill the last 365 UTC days and push to GitHub:

```bash
npm run fill-year:push
```

## Options

- `--count <number>`: how many commits to create. Default is `100`.
- `--dry-run`: preview dates only; do not create commits.
- `--push`: push after all commits are created.
- `--fill-year`: create a dense contribution pattern instead of random dates.
- `--days <number>`: how many UTC days to fill when using `--fill-year`. Default is `365`.
- `--per-day <number>`: how many commits to create per UTC day when using `--fill-year`. Default is `10`.

## Normal GitHub update flow

If you only want to upload code changes from this project to GitHub, use:

```bash
git add .
git commit -m "Describe your change"
git push origin main
```

## Notes

- The script updates `data.json` on every generated commit.
- The GitHub remote is already configured in this repository.
- Preview first if you are unsure; the script now waits for an explicit `--push` before publishing.
- Fill mode uses UTC midday timestamps so the dates line up with GitHub's contribution calendar.
