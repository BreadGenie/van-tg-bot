import TelegramBot = require('node-telegram-bot-api');
import { ScrapedGroup, ScrapedIdol } from '../types';

export const prettifyReply = (result: ScrapedIdol | ScrapedGroup): string => {
  let description = ``;
  const botId = process.env.BOT_ID || 'VanBT21_Bot';

  if (!('Members' in result)) {
    let idolKeys = Object.keys(result);

    for (let i = 1; i < idolKeys.length - 2; i++) {
      const vals = result[`${idolKeys[i]}`];
      if (!vals && !vals.trim()) delete result[`${idolKeys[i]}`];
    }

    idolKeys = Object.keys(result);

    for (let i = 1; i < idolKeys.length - 2; i++) {
      const res = result[idolKeys[i]];

      if (i === 1) description += `<u>Idol</u>\n\n<i>${res}</i>\n\n`;
      else if (idolKeys[i] === 'Group') {
        description += `<b>${idolKeys[i]}:</b> `;
        res.forEach((gp, i) => {
          description += `<a href='https://t.me/${botId}?start=GP${gp.replace(
            /\s/g,
            '--'
          )}'>${gp}</a>`;
          if (res.length > i + 1) description += ', ';
        });
        description += '\n';
      } else if (idolKeys[i] !== 'description')
        description += `<b>${idolKeys[i]}:</b> ${res}\n`;
      else description += `\n${res}\n\n`;
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
    const groupName = result['name'];

    description += `<u>Group</u>\n\n<i>${groupName}</i>\n\n`;

    for (let i = 2; i < groupKeys.length - 1; i++) {
      if (i !== groupKeys.length - 2)
        description += `<b>${groupKeys[i]}:</b> ${result[groupKeys[i]]}\n`;
      else {
        description += `<b>${groupKeys[i]}:</b>\n`;
        result[groupKeys[i]].forEach((member: string) => {
          description += `<a href='https://t.me/${botId}?start=ID${member.replace(
            /\s/g,
            '--'
          )}--${groupName.split(' ')[0]}'>${member}</a>\n`;
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
