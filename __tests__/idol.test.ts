import { searchIdol } from '../src/modules/idol';
import { scrapeIdolList } from '../src/helpers/scrapeAll';
import { SEND_ID, NO_ID } from '../src/helpers/strings';
import { join } from 'path';
import { unlink } from 'fs';

describe('/idol tests', () => {
  beforeAll(async () => {
    return await scrapeIdolList();
  });

  test('should check if idol details are returned properly (group)', async () => {
    const result = await searchIdol('jin bts');
    if (typeof result !== 'string') {
      const { picLink, name, group, label } = result;

      expect(picLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
      expect(name).toBe('Jin (Kim SeokJin / 김석진)');
      expect(group).toBe('BTS');
      expect(label).toBe('BIGHIT MUSIC');
    }
  });

  test('should check if idol details are returned properly (solo)', async () => {
    const result = await searchIdol('IU');
    if (typeof result !== 'string') {
      const { picLink, name, label, nationality } = result;

      expect(picLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
      expect(name).toBe('IU (Lee JiEun / 이지은)');
      expect(label).toBe('EDAM Entertainment LOEN');
      expect(nationality).toBe('Korean');
    }
  });

  test('should ask to send idol name if no idol provided', async () => {
    const output = await searchIdol('');

    expect(output).toBe(SEND_ID);
  });

  test('should output multiple idol names when there are multiple entries in the site', async () => {
    const output = await searchIdol('jin');
    const final =
      'Found Multiple Results:\n\nJin - LOVELYZ\nJin - MVP\nJin -  \nJin - BTS\n\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;';

    expect(output).toBe(final);
  });

  test('should output idol not found if no idol found in the site', async () => {
    const output = await searchIdol('BreadGenie');

    expect(output).toBe(NO_ID);
  });

  afterAll(() => {
    return unlink(join(__dirname + '/../idols.json'), (err) => {
      if (err) {
        // console.log(err);
      }
    });
  });
});
