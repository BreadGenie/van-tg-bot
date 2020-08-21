const cheerio = require('cheerio');
const request = require('request');
let f = 0;

function scrapeIdol(bot, msg, foundIdol) {
  request(foundIdol[0].idolLink, (error, response, html2) => {
    const $ = cheerio.load(html2);
    const foundCSS = $('#content-wrap').children('style').html();
    const idolPicLink = foundCSS.match(/https(.*?)jpg/g);
    let idolDescription = "🕺💃 <u>Idol</u>\n\n<i>" + $('.profile-top').children('h4').text() + "</i>\n<b>Group:</b> " + $('.profile-top').children('span').text() + "\n";
    let idolDesc = [];
    $('.half p').each((i, el) => {
      idolDesc.push($(el).text());
    });
    idolDescription += "<b>Label:</b> " + idolDesc[0] + "\n<b>Nationality:</b> " + idolDesc[1] + "\n<b>Birthday:</b> " + idolDesc[2] + "\n<b>Blood Type:</b> " + idolDesc[3] + "\n<b>Height:</b> " + idolDesc[4];
    if (idolDesc[5] !== undefined) {
      idolDescription += "\n<b>Weight:</b> " + idolDesc[5];
    }
    $('.full p').each((i, el) => {
      idolDesc.push($(el).text());
    });
    let k = 0;
    while (idolDesc[idolDesc.length - k - 1] === ' ' || idolDesc[idolDesc.length - k - 1] === '') {
      k++;
    }
    idolDescription += '\n<b>Position:</b> ' + idolDesc[idolDesc.length - k - 1];
    bot.sendPhoto(msg.chat.id, idolPicLink[0], {
      caption: idolDescription,
      reply_to_message_id: msg.message_id,
      parse_mode: 'HTML'
    });
  });
};

function idolNotFound(bot, msg) {
  bot.sendMessage(msg.chat.id, "Idol not found!\nPlease check your spelling and make sure the given name is a <b>Stage Name</b>", {
    reply_to_message_id: msg.message_id,
    parse_mode: 'HTML'
  });
};

exports.group = (bot, msg, command) => {
  let findGroup = command.input.split("/group ")[1];
  if (findGroup === undefined) {
    bot.sendMessage(msg.chat.id, "Send Group Name!", {
      reply_to_message_id: msg.message_id
    });
  } else {
    findGroup = findGroup.toLowerCase();
    request('https://www.kpopmap.com/kpop-member-profile/', (err, res, html) => {
      if (!err && res.statusCode === 200) {
        const $ = cheerio.load(html);
        let groups = [];
        $('li a').each((i, el) => {
          if (f === 0) {
            if ($(el).text() === '(G)I-DLE') {
              f = 1;
              groups.push({
                groupName: $(el).text().toLowerCase(),
                groupLink: $(el).attr('href')
              });
            }
          } else {
            groups.push({
              groupName: $(el).text().toLowerCase(),
              groupLink: $(el).attr('href')
            });
            if ($(el).text() === 'Z-Girls T.P.I') {
              f = 0;
            }
          }
        });
        const foundGroup = groups.find(group => group.groupName === findGroup)
        if (foundGroup) {
          request(foundGroup.groupLink, (error, response, html2) => {
            if (!err && res.statusCode === 200) {
              const $ = cheerio.load(html2);
              const foundCSS = $('#content-wrap').children('style').html();
              const idolPicLink = foundCSS.match(/https(.*?)jpg/g);
              let groupDescription = "<b>Group:</b> " + $('.profile-top').children('h4').text() + "\n<b>Label:</b> " + $('p').children('.label').text();
              let groupDebNFan = [];
              $('.half p').each((i, el) => {
                groupDebNFan.push($(el).text());
              });
              groupDescription += "\n<b>Debut:</b> " + groupDebNFan[0] + "\n<b>Fandom:</b> " + groupDebNFan[1] + "\n<b>Members:</b>\n";
              $('.name a').each((i, el) => {
                groupDescription += " <code>" + $(el).text() + "</code>\n";
              });
              bot.sendPhoto(msg.chat.id, idolPicLink[0], {
                caption: groupDescription,
                reply_to_message_id: msg.message_id,
                parse_mode: "HTML"
              })
            }
          });
        } else {
          bot.sendMessage(msg.chat.id, "Group not found!\n", {
            reply_to_message_id: msg.message_id
          });
        }
      } else {
        if (err) {
          console.error(err);
        } else {
          console.log(res.statusCode);
        }
      }
    });
  }
};

exports.idol = (bot, msg, command) => {
  let findIdol = command.input.split("/idol ")[1];
  let findIdolGroup = '';
  if (findIdol === undefined) {
    bot.sendMessage(msg.chat.id, "Send Group Name!", {
      reply_to_message_id: msg.message_id
    });
  } else {
    if (findIdol.includes(" ")) {
      findIdol = command.input.split(" ")[1].toLowerCase();
      findIdolGroup = command.input.split(" ")[2].toLowerCase();
    } else {
      findIdolGroup = undefined;
    }
    request('https://www.kpopmap.com/kpop-profile/', (err, res, html) => {
      if (!err && res.statusCode === 200) {
        let idols = [];
        const $ = cheerio.load(html);
        $('p a').each((i, el) => {
          idols.push({
            idolName: $(el).text().toLowerCase(),
            idolGroup: $(el).next().text().toLowerCase(),
            idolLink: $(el).attr('href')
          });
        });
        if (findIdolGroup === undefined) {
          const foundIdol = idols.filter(idol => idol.idolName === findIdol);
          if (foundIdol.length > 0) {
            if (foundIdol.length === 1) {
              scrapeIdol(bot, msg, foundIdol);
            } else {
              let foundIdols = 'Found Multiple Results:\n\n';
              foundIdol.forEach(idol => {
                foundIdols += idol.idolName.charAt(0).toUpperCase() + idol.idolName.slice(1) + " - " + idol.idolGroup.toUpperCase() + "\n";
              });
              foundIdols += "\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;"
              bot.sendMessage(msg.chat.id, foundIdols, {
                reply_to_message_id: msg.message_id,
                parse_mode: 'HTML'
              });
            }
          } else {
            idolNotFound(bot, msg);
          }
        } else {
          const foundIdol = idols.filter(idol => idol.idolName === findIdol && idol.idolGroup === findIdolGroup);
          if (foundIdol.length > 0) {
            scrapeIdol(bot, msg, foundIdol);
          } else {
            idolNotFound(bot, msg);
          }
        }
      } else {
        if (err) {
          console.error(err);
        } else {
          console.log(res.statusCode);
        }
      }
    });
  }
}
