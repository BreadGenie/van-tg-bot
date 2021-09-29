import TelegramBot = require('node-telegram-bot-api');
import { ScrapedGroup, ScrapedIdol } from '../types';

export const prettifyReply = (result: ScrapedIdol | ScrapedGroup): string => {
  let description = ``;
  if (!('Members' in result)) {
    let idolKeys = Object.keys(result);

    for (let i = 1; i < idolKeys.length - 2; i++) {
      if (!result[`${idolKeys[i]}`].trim()) delete result[`${idolKeys[i]}`];
    }

    idolKeys = Object.keys(result);

    for (let i = 1; i < idolKeys.length - 2; i++) {
      if (i === 1)
        description += `<u>Idol</u>\n\n<i>${result[idolKeys[i]]}</i>\n\n`;
      else if (idolKeys[i] !== 'description')
        description += `<b>${idolKeys[i]}:</b> ${result[idolKeys[i]]}\n`;
      else description += `\n${result[idolKeys[i]]}\n\n`;
    }
    if ('sns' in result) {
      description += `<b>${idolKeys[idolKeys.length - 2]}:</b>\n`;
      const snsKeys = Object.keys(result['sns']);
      for (let i = 0; i < snsKeys.length; i++) {
        description += `<a href='${result['sns'][`${snsKeys[i]}`]}'>${
          snsKeys[i]
        }</a>\n`;
      }
    }
  } else {
    const groupKeys = Object.keys(result);

    for (let i = 1; i < groupKeys.length - 1; i++) {
      if (i !== groupKeys.length - 2)
        description += `<b>${groupKeys[i]}:</b> ${result[groupKeys[i]]}\n`;
      else {
        description += `<b>${groupKeys[i]}:</b>\n`;
        result[groupKeys[i]].forEach((member: string) => {
          description += `<code>${member}</code>\n`;
        });
      }
    }
  }
  return description;
};

export const sendReply = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  result: string | ScrapedIdol | ScrapedGroup
): Promise<void> => {
  if (typeof result === 'string') {
    bot.sendMessage(msg.chat.id, result, {
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
    });
  } else {
    const { picLink } = result;

    const description = prettifyReply(result);

    bot.sendPhoto(msg.chat.id, picLink, {
      caption: description,
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
    });
  }
};
