import cheerio from 'cheerio';
import { existsSync, writeFileSync } from 'fs';

import { asyncForEach, waitFor } from '../helpers/asyncForEach';
import { fetch } from './fetch';

const pageInitials = 'abcdefghijklmnopqrstuvwxyz';

export const scrapeIdolList = async (initials = ['0~9', ...pageInitials]): Promise<boolean> => {
  const idols = [];
  console.log(`Fetching Idols...`);

  await asyncForEach(initials, async (initial: string) => {
    await waitFor(50);

    const idolResult = await fetch(
      `https://www.kpopmap.com/kpop-profile/?initial=${initial}`,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
        },
      }
    );
    const idolBody = await idolResult.text();

    const $ = cheerio.load(idolBody);

    $('.name > a').each((i, el) => {
      idols.push({
        idolName: $(el).text().toLowerCase(),
        idolGroup: $(el).next().text().toLowerCase(),
        idolLink: $(el).attr('href'),
      });
    });
  });

  if (idols.length > 0) {
    writeFileSync('idols.json', JSON.stringify(idols));
    console.log(`Fetching Idols completed!`);
    return true;
  }
  return false;
};

export const scrapeGroupList = async (initials = ['0~#', ...pageInitials]): Promise<boolean> => {
  const groups = [];
  console.log(`Fetching Groups...`);
  await asyncForEach(initials, async (initial: string) => {
    await waitFor(50);

    const groupResult = await fetch(
      `https://www.kpopmap.com/kpop-member-profile/?initial=${initial}`,
      {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
        },
      }
    );

    const groupBody = await groupResult.text();

    const $ = cheerio.load(groupBody);

    $('.name a')
      .not('.label')
      .each((i, el) => {
        groups.push({
          groupName: $(el).text().toLowerCase(),
          groupLink: $(el).attr('href'),
        });
      });
  });

  if (groups.length > 0) {
    writeFileSync('groups.json', JSON.stringify(groups));
    console.log(`Fetching Groups completed!`);
    return true;
  }
  return false;
};

export const scrapeNStore = async (): Promise<void> => {
  const initTime = performance.now();
  if (!existsSync('groups.json')) await scrapeGroupList();
  if (!existsSync('idols.json')) await scrapeIdolList();
  const finalTime = performance.now();

  console.log(`Scraping Groups and Idols took ${finalTime - initTime}ms`);
};
