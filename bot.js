const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const mongoose = require('mongoose');
const help = require(__dirname + '/modules/help.js');
const scrape = require(__dirname + '/modules/webscrape.js');
const inline = require(__dirname + '/modules/inline.js');
const random = require(__dirname + '/modules/random.js');
const token = process.env.TELEGRAM_TOKEN;
const url = process.env.APP_URL;
const mongodbURL = process.env.MONGO_URL;
let options = {};
var flag = false;

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

mongoose.connect(mongodbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const randomPicSchema = new mongoose.Schema({
  fileID: [String],
  fileUniqueID: [String],
  group: String
});

const RandomPic = new mongoose.model("RandomPic", randomPicSchema);

bot.on('message', (msg) => {
  if (msg.chat.id === Number(process.env.RANDPIC_CHAT_ID) && flag === true && msg.photo) {
    random.groupSetPic(bot, msg, RandomPic);
  }
});

bot.onText(/^\/flag$/, msg => {
  if (flag !== true) {
    flag = true;
    bot.sendMessage(msg.chat.id, "Flag is turned on!", {
      reply_to_message_id: msg.message_id
    });
  } else {
    flag = false;
    bot.sendMessage(msg.chat.id, "Flag is turned off!", {
      reply_to_message_id: msg.message_id
    });
  }
});

bot.on('inline_query', (query) => {
  inline.group(bot, query);
});

bot.onText(/^\/random($| )/, (msg, command) => {
  random.randPic(bot, msg, command, RandomPic);
});

bot.onText(/^\/setrandpic($| )/, (msg, command) => {
  random.setRandPic(bot, msg, command, RandomPic);
});

bot.onText(/^\/rmrandpic($|@VanBT21_Bot)/, (msg, command) => {
  random.rmRandPic(bot, msg, command, RandomPic);
});

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
