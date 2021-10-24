import TelegramBot = require('node-telegram-bot-api');

const githubButton = {
  inline_keyboard: [
    [{
      text: '🤖 Source Code',
      url: 'https://github.com/BreadGenie/van-tg-bot'
    }]
  ]
};

const help = (bot: TelegramBot, msg: TelegramBot.Message): void => {
  bot.sendMessage(
    msg.chat.id,
    'Hey, I am Van 🤖\nA K-Pop Telegram bot!\n\nUse /group &lt;group-name&gt; to query a Group\n\nUse /idol &lt;idol-name&gt to query an Idol',
    {
      parse_mode: 'HTML',
      reply_markup: githubButton,
    }
  );
};

export default help;
