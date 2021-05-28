const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const help = require(__dirname + '/modules/help.js');
const group = require(__dirname + '/modules/group.js');
const idol = require(__dirname + '/modules/idol.js');
const inline = require(__dirname + '/modules/inlineGroup.js');
const reply = require(__dirname + '/utils/reply.js');
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

bot.on('inline_query', async (query) => {
  await inline.group(bot, query);
});

bot.onText(/^\/group($| )/, async (msg, command) => {
  const result = await group.sendGroup(command);
  await reply.sendReply(bot, msg, result);
});

bot.onText(/^\/idol($| )/, async (msg, command) => {
  const result = await idol.sendIdol(command);
  await reply.sendReply(bot, msg, result);
});

bot.onText(/^\/help($|@VanBT21_Bot)/, msg => {
  help.help(bot, msg);
});

bot.onText(/^\/start($|@VanBT21_Bot)/, async msg => {
  if (!("forward_from" in msg)) {
    await reply.sendReply(bot, msg, "Hey, I am Van.\nA K-Pop DB Telegram bot!\n\nUse /help to view the functions of the bot");
  }
});

bot.on("polling_error", console.log);