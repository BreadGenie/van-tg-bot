import cheerio from 'cheerio';
import { writeFileSync } from 'fs';

import { fetch } from './fetch';

export const scrapeIdolList = async (): Promise<void> => {
  const idolResult = await fetch('https://www.kpopmap.com/kpop-profile/', {
    headers: {
      'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
    },
  });
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

  if (idols.length > 0) writeFileSync('idols.json', JSON.stringify(idols));
};

export const scrapeGroupList = async (): Promise<void> => {
  const groupResult = await fetch(
    'https://www.kpopmap.com/kpop-member-profile/',
    {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0',
      },
    }
  );
  const groupBody = await groupResult.text();

  const $ = cheerio.load(groupBody);
  const groups = [];

  $('.name a')
    .not('.label')
    .each((i, el) => {
      groups.push({
        groupName: $(el).text().toLowerCase(),
        groupLink: $(el).attr('href'),
      });
    });

  if (groups.length > 0) writeFileSync('groups.json', JSON.stringify(groups));
};

export const scrapeNStore = async (): Promise<void> => {
  await scrapeGroupList();
  await scrapeIdolList();
};
