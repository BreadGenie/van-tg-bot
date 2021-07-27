import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

export const scrapeIdolList = async (): Promise<void> => {
  const idolResult = await fetch('https://www.kpopmap.com/kpop-profile/');
  const idolBody = await idolResult.text();

  const $ = cheerio.load(idolBody);
  const idols = [];

  $('.name > a').each((i, el) => {
    idols.push({
      idolName: $(el).text().toLowerCase(),
      idolGroup: $(el).next().text().toLowerCase(),
      idolLink: $(el).attr('href'),
    });
  });

  writeFileSync('idols.json', JSON.stringify(idols));
};

export const scrapeGroupList = async (): Promise<void> => {
  const groupResult = await fetch(
    'https://www.kpopmap.com/kpop-member-profile/'
  );
  const groupBody = await groupResult.text();

  const $ = cheerio.load(groupBody);
  const groups = [];

  $('.name a').each((i, el) => {
    groups.push({
      groupName: $(el).text().toLowerCase(),
      groupLink: $(el).attr('href'),
    });
  });

  writeFileSync('groups.json', JSON.stringify(groups));
};

export const scrapeNStore = async (): Promise<void> => {
  await scrapeGroupList();
  await scrapeIdolList();
};
