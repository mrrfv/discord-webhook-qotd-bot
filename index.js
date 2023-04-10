// Load the fs module to read and write files
import fs from 'fs';

// Load the node-schedule module to schedule jobs
import schedule from 'node-schedule'

// Load the dotenv module to access environment variables
import dotenv from 'dotenv';
dotenv.config();

// Load the node-fetch module to make HTTP requests
import fetch from 'node-fetch';

// Check if the required environment variables are present
const required_env_vars = [
  "WEBHOOK_URL",
  "CRON_SCHEDULE"
]

for (const env_var of required_env_vars) {
  if (!process.env[env_var]) {
    console.error(`Missing environment variable: ${env_var} - the bot cannot continue.`);
    console.error(`Required environment variables: ${required_env_vars.join(', ')}`);
    console.error(`Refer to the documentation for more information.`)
    process.exit(1);
  }
}

// Define a function that posts a question of the day using a discord webhook
async function postQuestion(question, progress, questionsLength) {
  // Create an embed object with some styling and the question as the description
  const embed = {
    color: 0x00ff00,
    title: 'Question of the Day',
    description: question,
    timestamp: new Date(),
    footer: {
      text: progress && questionsLength ? `Question ${progress + 1} of ${questionsLength}` : `Discord QOTD Bot`
    }
  };

  // Make a POST request to the webhook url with the embed as the payload
  try {
    const response = await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({embeds: [embed]})
    });

    // Check if the response status is ok
    if (response.ok) {
      // Log a success message with the question
      console.log(`Posted question: ${question}`);
    } else {
      // Log an error message with the status code and text
      console.error(`Failed to post question: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Log an error message with the error object
    console.error(`Failed to post question: ${error}`);
  }
}

// Define a function that reads the questions from a json file and returns an array
function readQuestions() {
  // Read the file synchronously and parse it as json
  try {
    const data = fs.readFileSync('./questions.json', 'utf8');
    const json = JSON.parse(data);

    // Return the questions array or an empty array if it does not exist
    return json.questions || [];
  } catch (error) {
    // Log an error message with the error object and return an empty array
    console.error(`Failed to read questions: ${error}`);
    return [];
  }
}

// Define a function that reads the progress from a text file and returns a number
function readProgress() {
  // Try to read the file synchronously and parse it as a number
  try {
    const data = fs.readFileSync('./progress.txt', 'utf8');
    const progress = Number(data);

    // Return the progress or 0 if it is not a valid number
    return isNaN(progress) ? 0 : progress;
  } catch (error) {
    // If the file does not exist, return 0. Otherwise, log an error message and return -1.
    if (error.code === 'ENOENT') {
      return 0;
    } else {
      console.error(`Failed to read progress: ${error}`);
      return -1;
    }
  }
}

// Define a function that writes the progress to a text file
function writeProgress(progress) {
  // Write the progress as a string to the file synchronously
  try {
    fs.writeFileSync('./progress.txt', String(progress));

    // Log a success message with the progress
    console.log(`Updated progress: ${progress}`);
  } catch (error) {
    // Log an error message with the error object
    console.error(`Failed to write progress: ${error}`);
  }
}

// Define a function that runs the main logic of the app
async function main() {
  // Get the questions array from the json file
  const questions = readQuestions();

  // Get the current progress from the text file
  let progress = readProgress();

  // Check if there are any questions left and if the progress is valid
  if (progress >= 0 && progress < questions.length) {
    // Get the current question from the array
    const question = questions[progress];

    // Post the question using the webhook
    await postQuestion(question, progress, questions.length);

    // Increment the progress by one and write it to the file
    progress++;
    writeProgress(progress);
  } else if (progress >= questions.length) {
    // Post a message saying there are no more questions and reset the progress to zero
    await postQuestion('There are no more questions. The bot will restart.');
    writeProgress(0);
  } else {
    // Log an error message saying that the progress is invalid and exit the app
    console.error('Invalid progress value. Exiting app.');
    process.exit(1);
  }
}

console.log("Bot started! The question will be posted according to the schedule.");
console.log(`Your current schedule: ${process.env.CRON_SCHEDULE}`);
// Set an interval to run the main function according to the schedule
schedule.scheduleJob(process.env.CRON_SCHEDULE, () => {
  main();
})