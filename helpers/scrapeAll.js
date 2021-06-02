const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

exports.scrapeIdolList = async () => {
    const idolResult = await fetch('https://www.kpopmap.com/kpop-profile/');
    const idolBody = await idolResult.text();

    $ = cheerio.load(idolBody);
    let idols = [];

    $('.name > a').each((i, el) => {
        idols.push({
            idolName: $(el).text().toLowerCase(),
            idolGroup: $(el).next().text().toLowerCase(),
            idolLink: $(el).attr('href')
        });
    });

    fs.writeFileSync('idols.json', JSON.stringify(idols));
};

exports.scrapeGroupList = async () => {
    const groupResult = await fetch('https://www.kpopmap.com/kpop-member-profile/');
    const groupBody = await groupResult.text();

    $ = cheerio.load(groupBody);
    let groups = []

    $('.name a').each((i, el) => {
        groups.push({
            groupName: $(el).text().toLowerCase(),
            groupLink: $(el).attr('href')
        });
    });

    fs.writeFileSync('groups.json', JSON.stringify(groups));
};

exports.scrapeNStore = async () => {
    await this.scrapeGroupList();
    await this.scrapeIdolList();
}