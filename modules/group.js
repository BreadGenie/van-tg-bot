const cheerio = require('cheerio');
const fetch = require('node-fetch');
let f = 0;

exports.sendGroup = async (command) => {
    let findGroup = command.input.split("/group ")[1];
    if (findGroup === undefined) {
        return ("Send Group Name!");
    } else {
        findGroup = findGroup.toLowerCase();

        const result = await fetch('https://www.kpopmap.com/kpop-member-profile/');
        const body = await result.text();

        $ = cheerio.load(body);
        groups = []

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

        const foundGroup = groups.find(group => group.groupName === findGroup);

        if (foundGroup) {
            const groupResult = await fetch(foundGroup.groupLink);
            const html = await groupResult.text();

            const $ = cheerio.load(html);
            const foundCSS = $('#content-wrap > style').html();
            const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
            let groupDescription = "<b>Group:</b> " + $('.profile-top').text().trim() + "\n";

            if ($('p > .label').parent().prev().text() === '' || $('p > .label').parent().prev().text() === ' ') {
                groupDescription += "\n" + $('.desc p').text() + "\n";
            } else {
                groupDescription += "<b>" + $('p > .label').parent().prev().text() + ":</b> " + $('p > .label').text() + "\n";
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

            return ([idolPicLink[0], groupDescription]);

        } else {
            return ("Group not found!");
        }
    }
}