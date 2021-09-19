import { searchGroup } from '../src/modules/group';
import { SEND_GP, NO_GP } from '../src/helpers/strings';
import { scrapeGroupList } from '../src/helpers/scrapeAll';
import { join } from 'path';
import { unlink } from 'fs';

describe('/group tests', () => {
  beforeAll(async () => {
    return await scrapeGroupList();
  });

  test('should check if group details are returned properly', async () => {
    const [groupPicLink, groupDescription] = await searchGroup('bts');
    const details =
      '<b>Group:</b> BTS (방탄소년단)\n<b>Label:</b> BIGHIT MUSIC\n<b>Debut:</b> Jun 2013\n<b>Official Fandom:</b> ARMY\n<b>Members:</b>\n <code>Jin</code>\n <code>Suga</code>\n <code>J-Hope</code>\n <code>RM</code>\n <code>JiMin</code>\n <code>V</code>\n <code>JungKook</code>\n';

    expect(groupDescription).toBe(details);
    expect(groupPicLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).jpg/);
  });

  test('should ask to send group name if no group provided', async () => {
    const output = await searchGroup('');

    expect(output).toBe(SEND_GP);
  });

  test('should output group not found if no group found in the site', async () => {
    const output = await searchGroup('DTS');

    expect(output).toBe(NO_GP);
  });

  afterAll(() => {
    return unlink(join(__dirname + '/../groups.json'), (err) => {
      if (err) {
        // console.log(err);
      }
    });
  });
});
