# LinkManagerBot

LinkManagerBot is a Telegram bot designed to manage and distribute links with visit limits. It allows administrators to add links with specific visit limits and users to request these links. The bot ensures that each user receives a unique link and tracks the number of visits to each link.

## Features

- Add new links with visit limits
- Track the number of visits to each link
- Ensure each user receives a unique link
- Admin commands for managing links
- User-friendly interface

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/mesamirh/LinkManagerBot.git
   ```
   ```
   cd LinkManagerBot
   ```
2. Install the dependencies:
   ```
   npm install
   ```
3. Create a .env file in the root directory and add your Telegram bot token and admin chat IDs:
   ```
   BOT_TOKEN=your-telegram-bot-token
   ADMIN_CHAT_IDS=adminid
   ```

## Usage

1. Start the bot:
   ```
   npm start
   ```
