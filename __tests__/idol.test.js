const idol = require(__dirname + '/../modules/idol.js')
const strings = require(__dirname + '/../helpers/strings.js')
const scraper = require(__dirname + '/../helpers/scrapeAll.js');
const path = require('path');
const fs = require('fs');

describe('/idol tests', () => {

    beforeAll(async () => {
        return await scraper.scrapeIdolList();
    });

    test('should check if idol details are returned properly (group)', async () => {
        const [idolPicLink, idolDescription] = await idol.sendIdol('jin bts');
        const details = "<u>Idol</u>\n\n<i>Jin (Kim SeokJin / 김석진)</i>\n\n<b>Group:</b> BTS\n<b>Label:</b> BIGHIT MUSIC\n<b>Nationality:</b> Korean\n<b>Birthdate:</b> Dec 04 1992\n<b>Blood Type:</b> O\n<b>Height:</b> 179 cm\n<b>Weight:</b> 63 kg\n<b>Position:</b> Vocal";

        expect(idolDescription).toBe(details);
        expect(idolPicLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
    });

    test('should check if idol details are returned properly (solo)', async () => {
        const [idolPicLink, idolDescription] = await idol.sendIdol('IU');
        const details = "<u>Idol</u>\n\n<i>IU (Lee JiEun / 이지은)</i>\n\n<b>Label:</b> LOEN\n<b>Nationality:</b> Korean\n<b>Birthdate:</b> May 16 1993\n<b>Blood Type:</b> A\n<b>Height:</b> 162 cm\n<b>Weight:</b> 47 kg\n<b>Position:</b> Vocal";

        expect(idolDescription).toBe(details);
        expect(idolPicLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
    });

    test('should ask to send idol name if no idol provided', async () => {
        const output = await idol.sendIdol('');

        expect(output).toBe(strings.SEND_ID);
    });

    test('should output multiple idol names when there are multiple entries in the site', async () => {
        const output = await idol.sendIdol('jin');
        const final = 'Found Multiple Results:\n\nJin - GIDONGDAE\nJin - BTS\nJin - LOVELYZ\n\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;';

        expect(output).toBe(final);
    });

    test('should output idol not found if no idol found in the site', async () => {
        const output = await idol.sendIdol('Bread Genie');

        expect(output).toBe(strings.NO_ID);
    });

    afterAll(() => {
        return fs.unlink(path.join(__dirname + '/../idols.json'), err => {
            if (err) {
                console.log(err);
            }
        });
    });
});