const group = require(__dirname + '/../modules/group.js')

describe('/group tests', () => {

    test('it should check if group details are returned properly', async () => {
        const [groupPicLink, groupDescription] = await group.sendGroup({ input: '/group bts' });
        const details = "<b>Group:</b> BTS (방탄소년단)\n<b>Label:</b> BIGHIT MUSIC\n<b>Debut:</b> Jun 2013\n<b>Official Fandom:</b> ARMY\n<b>Members:</b>\n <code>Jin</code>\n <code>Suga</code>\n <code>J-Hope</code>\n <code>RM</code>\n <code>Jimin</code>\n <code>V</code>\n <code>JungKook</code>\n"

        expect(groupDescription).toBe(details);
        expect(groupPicLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).jpg/);
    });

    test('it should ask to send group name if no group provided', async () => {
        const output = await group.sendGroup({ input: '/group' });
        const final = 'Send Group Name!';

        expect(output).toBe(final);
    });

    test('it should output group not found if no group found in the site', async () => {
        const output = await group.sendGroup({ input: '/group DTS' });
        const final = 'Group not found!';

        expect(output).toBe(final);
    });
});