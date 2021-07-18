const group = require(__dirname + '/../src/modules/group.js');
const strings = require(__dirname + '/../src/helpers/strings.js');
const scraper = require(__dirname + '/../src/helpers/scrapeAll.js');
const path = require('path');
const fs = require('fs');

describe('/group tests', () => {

    beforeAll(async () => {
        return await scraper.scrapeGroupList();
    });

    test('should check if group details are returned properly', async () => {
        const [groupPicLink, groupDescription] = await group.sendGroup('bts');
        const details = "<b>Group:</b> BTS (방탄소년단)\n<b>Label:</b> BIGHIT MUSIC\n<b>Debut:</b> Jun 2013\n<b>Official Fandom:</b> ARMY\n<b>Members:</b>\n <code>Jin</code>\n <code>Suga</code>\n <code>J-Hope</code>\n <code>RM</code>\n <code>JiMin</code>\n <code>V</code>\n <code>JungKook</code>\n"

        expect(groupDescription).toBe(details);
        expect(groupPicLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).jpg/);
    });

    test('should ask to send group name if no group provided', async () => {
        const output = await group.sendGroup('');

        expect(output).toBe(strings.SEND_GP);
    });

    test('should output group not found if no group found in the site', async () => {
        const output = await group.sendGroup('DTS');

        expect(output).toBe(strings.NO_GP);
    });

    afterAll(() => {
        return fs.unlink(path.join(__dirname + '/../groups.json'), err => {
            if (err) {
                console.log(err);
            }
        });
    });
});