const cheerio = require('cheerio');
const request = require('request');
let f = 0;

exports.group = (bot, query) => {
  let findGroup = query.query.toLowerCase();
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
            const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
            const groupName = $('.profile-top').children('h4').text();
            const groupLabel = $('p').children('.label').text();
            let groupDescription = "<b>Group:</b> " + '<a href="' + idolPicLink[0] + '">' + groupName + "</a>\n";
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
            let result = [{
              type: 'article',
              id: query.id,
              thumb_url: idolPicLink[0],
              title: groupName,
              description: groupLabel,
              input_message_content: {
                message_text: groupDescription,
                parse_mode: 'HTML'
              }
            }];
            bot.answerInlineQuery(query.id, result);
          }
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
};
