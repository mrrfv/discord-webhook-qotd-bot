# Discord Question of the Day Bot

This is a Node.js application that utilizes a discord webhook to post a question of the day from a file to a Discord channel. It reads a JSON object containing an array of questions and posts one question according to your schedule.

## Usage

1. Include your own questions in `questions.json`. A format is included in `questions.json.format`.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in the values.
4. Run `node index.js`.

## Docker

You can also run this bot in a Docker container. To do so, use the following commands:

```bash
# Create progress.txt file
cat 0 > "$(pwd)"/progress.txt
# Make sure to also create the questions.json file in the same directory

# Run the image
docker run -d \ 
    -e WEBHOOK_URL="enter webhook url here" \ 
    -e CRON_SCHEDULE="enter cron schedule here" \ 
    --mount type=bind,source="$(pwd)"/questions.json,target=/app/questions.json,readonly \ 
    --mount type=bind,source="$(pwd)"/progress.txt,target=/app/progress.txt \ 
    --restart always \ 
    --name qotdbot \ 
    mrrfv/discord-webhook-qotd-bot:latest
```

The command above expects that the progress.txt and questions.json files already exist, and that they are in the current directory.

## License

BSD 3-Clause License. See `LICENSE` for more information.

## Donations

If you would like to donate to support this project, you can do so via Liberapay - see my GitHub profile for the link.
