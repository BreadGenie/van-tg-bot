const cheerio = require('cheerio');
const request = require('request');

exports.random = (bot, msg, command) => {
  if (command.input === '/random') {
    bot.sendMessage(msg.chat.id, "Send Group Name!", {
      reply_to_message_id: msg.message_id
    });
  } else {
    let query = command.input.split("/random ")[1].replace(/ /g, '+');
    request('https://www.kpopmap.com/photo/?people=' + query, (err, res, html) => {
      if (!err && res.statusCode === 200) {
        const $ = cheerio.load(html);
        let links = [];
        $('.post-img a').each((i, el) => {
          links.push($(el).attr('data-permalink'));
        });
        if (links.length > 0) {
          request(links[Math.floor(Math.random() * links.length)], (error, response, HTML) => {
            if (!error && response.statusCode === 200) {
              const $ = cheerio.load(HTML);
              let picLinks = [];
              $('#fotorama a').each((i, el) => {
                picLinks.push($(el).attr('href'));
              });
              bot.sendPhoto(msg.chat.id, picLinks[Math.floor(Math.random() * picLinks.length)], {
                reply_to_message_id: msg.message_id
              });
            }
          });
        } else {
          bot.sendMessage(msg.chat.id, "Result not found!", {
            reply_to_message_id: msg.message_id
          });
        }
      }
    });
  }
};
