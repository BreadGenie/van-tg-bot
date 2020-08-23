const cheerio = require('cheerio');
const request = require('request');
let f = 0;

function scrapeIdol(bot, msg, foundIdol) {
  request(foundIdol[0].idolLink, (error, response, html2) => {
    const $ = cheerio.load(html2);
    const foundCSS = $('#content-wrap').children('style').html();
    const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
    let idolDescription = "🕺 <u>Idol</u> 💃\n\n<i>" + $('.profile-top').children('h4').text() + "</i>\n\n<b>Group:</b> " + $('.profile-top').children('span').text() + "\n";
    let idolDesc = [];
    $('.half p').each((i, el) => {
      idolDesc.push($(el).prev().text());
      idolDesc.push($(el).text());
    });
    for (var i = 0; i < idolDesc.length; i += 2) {
      idolDescription += "<b>" + idolDesc[i] + ":</b> " + idolDesc[i + 1] + "\n";
    }
    $('.full p').each((i, el) => {
      idolDesc.push($(el).prev().text());
      idolDesc.push($(el).text());
    });
    if (idolDesc[idolDesc.length - 2] === 'SNS') {
      idolDescription += "<b>" + idolDesc[idolDesc.length - 4] + ":</b> " + idolDesc[idolDesc.length - 3];
    } else {
      idolDescription += "<b>" + idolDesc[idolDesc.length - 2] + ":</b> " + idolDesc[idolDesc.length - 1];
    }
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
              let groupDescription = "<b>Group:</b> " + $('.profile-top').children('h4').text() + "\n";
              if ($('p').children('.label').parent().prev().text() === '' || $('p').children('.label').parent().prev().text() === ' ') {
                groupDescription += "\n" + $('.desc p').text() + "\n";
              } else {
                groupDescription += "<b>" + $('p').children('.label').parent().prev().text() + ":</b> " + $('p').children('.label').text() + "\n";
              }
              let groupDebNFan = [];
              $('.half p').each((i, el) => {
                groupDebNFan.push($(el).prev().text());
                groupDebNFan.push($(el).text());
              });
              for (var i = 0; i < groupDebNFan.length; i += 2) {
                groupDescription += "<b>" + groupDebNFan[i] + ":</b> " + groupDebNFan[i + 1] + "\n";
              }
              groupDescription += "<b>Members:</b>\n"
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
  let findIdol = '';
  let findIdolGroup = '';
  if (findIdol === undefined) {
    bot.sendMessage(msg.chat.id, "Send Idol Name!", {
      reply_to_message_id: msg.message_id
    });
  } else {
    if (command.input.includes('"')) {
      findIdol = command.input.match(/(?<=")(.*?)(?=")/g)[0];
      if (command.input.includes('" ')) {
        findIdolGroup = command.input.split(" ")[3].toLowerCase();
        findIdol = findIdol.toLowerCase();
      } else {
        findIdol = findIdol.toLowerCase();
        findIdolGroup = undefined;
      }
    } else {
      findIdol = command.input.split("/idol ")[1];
      if (findIdol.includes(" ")) {
        findIdolGroup = findIdol.split(" ")[1].toLowerCase();
        findIdol = findIdol.split(" ")[0].toLowerCase();
      } else {
        findIdol = findIdol.toLowerCase();
        findIdolGroup = undefined;
      }
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
