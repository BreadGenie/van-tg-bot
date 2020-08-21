const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const help = require(__dirname + '/modules/help.js');
const scrape = require(__dirname + '/modules/webscrape.js');
const token = process.env.TELEGRAM_TOKEN;
const url = process.env.APP_URL;
let options = {};

if (process.env.PORT === undefined) {
  options = {
    polling: true
  };
} else {
  options = {
    webHook: {
      port: process.env.PORT
    }
  };
}

const bot = new TelegramBot(token, options);

bot.setWebHook(`${url}/bot${token}`);

bot.onText(/^\/group($| )/, (msg, command) => {
  scrape.group(bot, msg, command);
});

bot.onText(/^\/idol($| )/, (msg, command) => {
  scrape.idol(bot, msg, command);
});

bot.onText(/^\/help($|@VanBT21_Bot)/, msg => {
  help.help(bot, msg);
});

bot.onText(/^\/start($|@VanBT21_Bot)/, msg => {
  if (!("forward_from" in msg)) {
    bot.sendMessage(msg.chat.id, "Hey, I am Van.\nA K-Pop DB Telegram bot!\n\nUse /help to view the functions of the bot", {
      reply_to_message_id: msg.message_id
    });
  }
});
