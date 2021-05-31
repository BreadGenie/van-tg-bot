const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const help = require(__dirname + '/modules/help.js');
const group = require(__dirname + '/modules/group.js');
const idol = require(__dirname + '/modules/idol.js');
const inline = require(__dirname + '/modules/inline.js');
const reply = require(__dirname + '/helpers/reply.js');
const strings = require(__dirname + '/helpers/strings.js');
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
  await inline.inline(bot, query);
});

bot.onText(/^\/group(@VanBT21_Bot)? ?(.*)/, async (msg, command) => {
  const result = await group.sendGroup(command[2]);
  await reply.sendReply(bot, msg, result);
});

bot.onText(/^\/idol(@VanBT21_Bot)? ?(.*)/, async (msg, command) => {
  const result = await idol.sendIdol(command[2]);
  await reply.sendReply(bot, msg, result);
});

bot.onText(/^\/help($|@VanBT21_Bot)/, msg => {
  help.help(bot, msg);
});

bot.onText(/^\/start($|@VanBT21_Bot)/, async msg => {
  if (!("forward_from" in msg)) {
    await reply.sendReply(bot, msg, strings.START_STRING);
  }
});

bot.on("polling_error", console.log);