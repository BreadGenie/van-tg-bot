import { searchGroup } from '../src/modules/group';
import { SEND_GP, NO_GP } from '../src/helpers/strings';
import { scrapeGroupList } from '../src/helpers/scrapeAll';
import { existsSync } from 'fs';

describe('/group tests', () => {
  beforeAll(async () => {
    if (!existsSync('groups.json')) return await scrapeGroupList();
  });

  test('should check if group details are returned properly', async () => {
    const result = await searchGroup('bts');
    if (typeof result !== 'string') {
      const { picLink, name, Label, Members } = result;

      expect(picLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
      expect(name).toBe('BTS (방탄소년단)');
      expect(Label).toBe('BIGHIT MUSIC');
      expect([
        'Jin',
        'Suga',
        'J-Hope',
        'j-hope',
        'RM',
        'JiMin',
        'V',
        'JungKook',
      ]).toEqual(expect.arrayContaining(Members!));
    }
  });

  test('should ask to send group name if no group provided', async () => {
    const output = await searchGroup('');

    expect(output).toBe(SEND_GP);
  });

  test('should output group not found if no group found in the site', async () => {
    const output = await searchGroup('RM');

    expect(output).toBe(NO_GP);
  });
});
