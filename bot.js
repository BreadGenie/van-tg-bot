const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const help = require(__dirname + '/modules/help.js');
const group = require(__dirname + '/modules/group.js');
const scrape = require(__dirname + '/modules/webscrape.js');
const inline = require(__dirname + '/modules/inline.js');
const token = process.env.TELEGRAM_TOKEN;
const url = process.env.APP_URL;

const options = process.env.PORT === undefined ? {
  polling: true
} : {
  webHook: {
    port: process.env.PORT
  }
}

const bot = new TelegramBot(token, options);

bot.setWebHook(`${url}/bot${token}`);

bot.on('inline_query', (query) => {
  inline.group(bot, query);
});

bot.onText(/^\/group($| )/, async (msg, command) => {
  const result = await group.sendGroup(bot, msg, command);
  
  if (typeof result === "string") {
    bot.sendMessage(msg.chat.id, result, {
      reply_to_message_id: msg.message_id
    });
  } else {
    const [idolPicLink, groupDescription] = result;

    bot.sendPhoto(msg.chat.id, idolPicLink, {
      caption: groupDescription,
      reply_to_message_id: msg.message_id,
      parse_mode: "HTML"
    });
  }
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

bot.on("polling_error", console.log);