import TelegramBot = require('node-telegram-bot-api');
import cron = require('node-cron');
import * as dotenv from 'dotenv';
import help from './modules/help';
import { searchGroup } from './modules/group';
import { searchIdol } from './modules/idol';
import { inline } from './modules/inline';
import { sendReply } from './helpers/reply';
import { scrapeNStore } from './helpers/scrapeAll';
import { ScrapedGroup, ScrapedIdol } from './types';

import { START_STRING } from './helpers/strings';

dotenv.config();

const token: string = process.env.TELEGRAM_TOKEN;
const url: string = process.env.APP_URL;
const port: string | undefined = process.env.PORT;

const options: TelegramBot.WebHookOptions | unknown =
  port === undefined
    ? {
        polling: true,
      }
    : {
        webHook: {
          port,
        },
      };

const bot = new TelegramBot(token, options);

bot.setWebHook(`${url}/bot${token}`);

(async () => {
  await scrapeNStore();
})();

cron.schedule('0 0 * * *', async () => {
  await scrapeNStore();
});

bot.on('inline_query', async (query) => {
  await inline(bot, query);
});

bot.onText(/^\/group(@VanBT21_Bot)? ?(.*)/, async (msg, command) => {
  const result: string | ScrapedGroup = await searchGroup(command[2]);
  await sendReply(bot, msg, result);
});

bot.onText(/^\/idol(@VanBT21_Bot)? ?(.*)/, async (msg, command) => {
  const result: string | ScrapedIdol = await searchIdol(command[2]);
  await sendReply(bot, msg, result);
});

bot.onText(/^\/help($|@VanBT21_Bot)/, (msg) => {
  help(bot, msg);
});

bot.onText(/^\/start($|@VanBT21_Bot)? ?(.*)/, async (msg, command) => {
  if (!('forward_from' in msg) && !command[2]) {
    await sendReply(bot, msg, START_STRING);
  } else {
    if (command[2].startsWith('GP')) {
      const result: string | ScrapedGroup = await searchGroup(
        command[2].substring(2)
      );
      await sendReply(bot, msg, result);
    } else if (command[2].startsWith('ID')) {
      const result: string | ScrapedIdol = await searchIdol(
        command[2].substring(2)
      );
      await sendReply(bot, msg, result);
    }
  }
});

// bot.on('polling_error', console.log);
