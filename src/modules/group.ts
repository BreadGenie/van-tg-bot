import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { SEND_GP, NO_GP } from '../helpers/strings';
import { Group, ScrapedGroup } from '../types';
import { matchStringArray } from '../helpers/dice';

const scrapeGroup = async (foundGroup: Group) => {
  const groupResult = await fetch(foundGroup.groupLink);
  const html = await groupResult.text();

  const $ = cheerio.load(html);
  const foundCSS = $('#content-wrap > style').html();
  const picLink = foundCSS.match(/https(.*?)(jpg|png)/g)[0];

  const scrapedGroup: ScrapedGroup = {
    picLink,
    group: $('.profile-top h2').text().trim(),
  };

  scrapedGroup[`${$('p > .label').parent().prev().text()}`] =
    $('p > .label').text();

  $('.half p').each((i, el) => {
    scrapedGroup[`${$(el).prev().text()}`] = $(el).text();
  });

  const members: string[] = [];

  $('.name a').each((i, el) => {
    members.push($(el).text());
  });

  scrapedGroup['members'] = members;

  return scrapedGroup;
};

export const searchGroup = async (
  command: string
): Promise<string | ScrapedGroup> => {
  if (command === '') {
    return SEND_GP;
  } else {
    const findGroup: string = command.toLowerCase();

    const rawdata: Buffer = readFileSync('groups.json');
    const groups: Group[] = JSON.parse(rawdata.toString());

    const groupArray = groups.map(({ groupName }) => groupName);

    const { bestMatch } = matchStringArray(findGroup, groupArray, {
      maxBestMatch: 3,
    });

    if (bestMatch[0].diceCoeff > 0.4) {
      const foundGroup = groups[bestMatch[0].index];
      return await scrapeGroup(foundGroup);
    } else {
      return NO_GP;
    }
  }
};
