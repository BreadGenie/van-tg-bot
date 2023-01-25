import { searchIdol } from '../src/modules/idol';
import { scrapeIdolList } from '../src/helpers/scrapeAll';
import { SEND_ID, NO_ID } from '../src/helpers/strings';
import { existsSync } from 'fs';

describe('/idol tests', () => {
  beforeAll(async () => {
    if (!existsSync('idols.json')) return await scrapeIdolList(['t']);
  });

  test('should check if idol details are returned properly (group)', async () => {
    const result = await searchIdol('taeyeon');
    if (typeof result !== 'string') {
      const { picLink, name, Group, Label } = result;

      expect(picLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
      expect(name).toBe('TaeYeon (Kim TaeYeon / 김태연)');
      expect(Group).toStrictEqual(["OH!GG", "Girls' Generation", "Girls On Top", "Girls Generation TTS"]);
      expect(Label).toBe('SM');
    }
  });

  test('should check if idol details are returned properly (solo)', async () => {
    const result = await searchIdol('Tiffany Young');
    if (typeof result !== 'string') {
      const { picLink, name, Label, Nationality } = result;

      expect(picLink).toMatch(/https:\/\/image.kpopmap.com\/(.*).(jpg|png)/);
      expect(name).toBe('Tiffany Young (Stephanie Young Hwang / 스테파니 영 황)');
      expect(Label).toBe('Paradigm Talent SUBLIME ARTIST AGENCY');
      expect(Nationality).toBe('Korean-American');
    }
  });

  test('should ask to send idol name if no idol provided', async () => {
    const output = await searchIdol('');

    expect(output).toBe(SEND_ID);
  });

  test('should output multiple idol names when there are multiple entries in the site', async () => {
    const output = await searchIdol('taeil');
    const splittedOutput = typeof output === 'string' ? output.split('\n') : [];
    const final = [
      'Found Multiple Results:',
      '',
      "<a href='https://t.me/VanBT21_Bot?start=IDTaeil--BLOCK B'>Taeil - BLOCK B</a>",
      "<a href='https://t.me/VanBT21_Bot?start=IDTaeil--NCT'>Taeil - NCT</a>",
      '',
      'Use /idol &lt;idol-name&gt; &lt;group-name&gt;',
    ];

    expect(splittedOutput.sort()).toEqual(final.sort());
  });

  test('should output idol not found if no idol found in the site', async () => {
    const output = await searchIdol('asdfghjkl');

    expect(output).toBe(NO_ID);
  });
});
