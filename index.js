require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const figlet = require("figlet");

dotenv.config();

const token = process.env.BOT_TOKEN;
const adminChatIds = process.env.ADMIN_CHAT_IDS.split(",").map((id) =>
  id.trim()
);
const bot = new TelegramBot(token, { polling: true });

const linksFilePath = path.join(__dirname, "links.json");
const usernamesFilePath = path.join(__dirname, "usernames.json");

// Loading links from JSON file
let links = [];
try {
  if (fs.existsSync(linksFilePath)) {
    const data = fs.readFileSync(linksFilePath, "utf8");
    links = JSON.parse(data);
    console.log("Loaded links:");
    console.log(links);
  }
} catch (error) {
  console.error("Error reading links.json:", error);
}

// Loading usernames from JSON file
let usernames = [];
try {
  if (fs.existsSync(usernamesFilePath)) {
    const data = fs.readFileSync(usernamesFilePath, "utf8");
    usernames = JSON.parse(data);
    console.log("Loaded usernames:");
    console.log(usernames);
  }
} catch (error) {
  console.error("Error reading usernames.json:", error);
}

const adminCommands = `
Available commands:
/start - Get commands
/addlink <url> <visit_limit> - Add new links with a visit limit
`;

// Saving to JSON file
function saveLinks() {
  try {
    fs.writeFileSync(linksFilePath, JSON.stringify(links, null, 2));
  } catch (error) {
    console.error("Error writing to links.json:", error);
  }
}

// Saving usernames to JSON file
function saveUsernames() {
  try {
    fs.writeFileSync(usernamesFilePath, JSON.stringify(usernames, null, 2));
  } catch (error) {
    console.error("Error writing to usernames.json:", error);
  }
}

// Displaying name
figlet("mesamirh", async (err, data) => {
  if (err) {
    console.error("Error generating logo:", err);
    return;
  }
  const chalk = await import("chalk");
  console.log(chalk.default.blue(data));
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text;
  const username = msg.from.username;
  const chalk = await import("chalk");

  if (adminChatIds.includes(chatId)) {
    console.log(chalk.default.blue(`Admin message from ${username}: ${text}`));
    // Admin message
    if (text === "/start") {
      bot.sendMessage(chatId, adminCommands);
    } else if (text.startsWith("/addlink")) {
      const [command, url, limit] = text.split(" ");
      if (url && limit) {
        if (!Array.isArray(links)) {
          links = [];
        }
        links.push({ url, limit: parseInt(limit), visits: 0 });
        saveLinks();
        bot.sendMessage(chatId, `Link added: ${url} with limit: ${limit}`);
        console.log(
          chalk.default.green(`Link added: ${url} with limit: ${limit}`)
        );
      } else {
        bot.sendMessage(chatId, "Usage: /addlink <url> <visit_limit>");
      }
    } else {
      bot.sendMessage(
        chatId,
        "Unknown command. Use /start to see available commands."
      );
    }
  } else {
    console.log(
      chalk.default.blue(`Received message from ${username}: ${text}`)
    );
    // Non-admin message
    if (usernames.includes(username)) {
      bot.sendMessage(
        chatId,
        "You have already received your link, please complete task there."
      );
      console.log(
        chalk.default.yellow(`User ${username} already received a link.`)
      );
    } else {
      if (links.length > 0) {
        let link = links[0];
        link.visits += 1;
        bot.sendMessage(chatId, `Visit this link: ${link.url}`);
        console.log(
          chalk.default.green(
            `Sent link to chat ${chatId}: ${link.url}, visits: ${link.visits}/${link.limit}`
          )
        );

        // Username tracking
        usernames.push(username);
        saveUsernames();
        console.log(chalk.default.green(`Username added: ${username}`));

        if (link.visits >= link.limit) {
          links.shift();
          saveLinks();
          console.log(chalk.default.red(`Link expired: ${link.url}`));
        }
      } else {
        bot.sendMessage(chatId, "No links available.");
        console.log(chalk.default.red(`No links available for chat ${chatId}`));
      }
    }
  }
});

bot.on("polling_error", async (error) => {
  const chalk = await import("chalk");
  console.error(chalk.default.red("Polling error:"), error);
});
