const cheerio = require('cheerio');
const request = require('request');
let f = 0;

exports.sendGroup = (bot, msg, command) => {
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
                            const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
                            let groupDescription = "<b>Group:</b> " + $('.profile-top').text().trim() + "\n";
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