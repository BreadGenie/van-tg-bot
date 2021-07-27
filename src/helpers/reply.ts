import TelegramBot = require('node-telegram-bot-api');
import { result } from '../types';

export const sendReply = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  result: result
): Promise<void> => {
  if (typeof result === 'string') {
    bot.sendMessage(msg.chat.id, result, {
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
    });
  } else {
    const [idolPicLink, groupDescription] = result;

    bot.sendPhoto(msg.chat.id, idolPicLink, {
      caption: groupDescription,
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML',
    });
  }
};
