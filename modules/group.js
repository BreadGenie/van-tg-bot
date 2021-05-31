const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const strings = require('../helpers/strings');

exports.sendGroup = async (command) => {
    if (command === '') {
        return (strings.SEND_GP);
    } else {
        const findGroup = command.toLowerCase();

        const rawdata = fs.readFileSync('./data/groups.json');
        const groups = JSON.parse(rawdata);

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
            return (strings.NO_GP);
        }
    }
}