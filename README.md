<img src="public/logo.png" alt="Peak" width="72" />

# Peak

**Find your peak. Post it again.**

Peak reads your post history, tells you why the weak ones died, and writes your next week from the ones that worked.

Built for the [Social Media Automation Hackathon](https://social-media-automation-hacks.devpost.com/).

## What it does

1. **Import.** Drop in a CSV export of your posts and their metrics. The standard X analytics export works out of the box. A sample export is bundled so you can try it in one click.
2. **Diagnose.** Peak scores every post against your own median engagement rate. Hits and misses are separated, and every miss gets a one sentence reason: ran long, weak hook, no hashtags, wrong time, or below baseline.
3. **Recipe.** Peak extracts a style guide from your winning posts only: opening patterns, length range, hashtag count, best days, best hours, and voice samples.
4. **Generate.** The model writes your next week of posts constrained by that recipe. Every draft states which rule it follows.
5. **Publish.** Copy each post, copy all, or send to a Telegram channel.

## Live demo

Deployed at [peak.sithunyein.com](https://peak.sithunyein.com). Click **Load sample data** to run the whole flow in one click.

## Run locally

```bash
npm install
cp .env.example .env.local   # add your Featherless key
npm run dev
```

Open http://localhost:3000.

## Tests

```bash
npm test
```

## Get your own data

1. Open X, go to your profile, then **More > View post analytics** (or use the analytics dashboard).
2. Choose a date range and export the post data as CSV.
3. Drop that file into Peak.

No API key and no credit card are needed for the CSV path.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `FEATHERLESS_API_KEY` | For Generate | Draft generation. Any OpenAI-compatible key works if you change the base URL. |
| `FEATHERLESS_MODEL` | No | Defaults to `Qwen/Qwen2.5-72B-Instruct`. |
| `TELEGRAM_BOT_TOKEN` | For Telegram publish | Bot token from BotFather. |
| `TELEGRAM_CHAT_ID` | For Telegram publish | The channel username or chat id. The bot must be an admin there. |

## Notes

- Analysis is deterministic and runs with no external calls. Only draft generation calls a model, so the report works even without a key.
- The X API no longer has a free tier. Live account import and posting to X would require paid X API credits, so Peak uses the free CSV export instead. Copy to clipboard and Telegram publish are free.
- The bundled sample export is real-shaped data, not a mock, so the demo runs the same code path as your own file.

## Tech

Next.js 16, TypeScript, Tailwind CSS v4, Featherless (OpenAI-compatible), Telegram Bot API, Vitest.
