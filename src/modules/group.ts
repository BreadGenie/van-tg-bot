import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { SEND_GP, NO_GP } from '../helpers/strings';
import { Group, result } from '../types';
import { matchStringArray } from '../helpers/dice';

const scrapeGroup = async (foundGroup: Group) => {
  const groupResult = await fetch(foundGroup.groupLink);
  const html = await groupResult.text();

  const $ = cheerio.load(html);
  const foundCSS = $('#content-wrap > style').html();
  const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
  let groupDescription =
    '<b>Group:</b> ' + $('.profile-top h2').text().trim() + '\n';

  if (
    $('p > .label').parent().prev().text() === '' ||
    $('p > .label').parent().prev().text() === ' '
  ) {
    groupDescription += '\n' + $('.desc p').text() + '\n';
  } else {
    groupDescription +=
      '<b>' +
      $('p > .label').parent().prev().text() +
      ':</b> ' +
      $('p > .label').text() +
      '\n';
  }

  const groupDebNFan: string[] = [];

  $('.half p').each((i, el) => {
    groupDebNFan.push($(el).prev().text());
    groupDebNFan.push($(el).text());
  });

  for (let i = 0; i < groupDebNFan.length; i += 2) {
    groupDescription +=
      '<b>' + groupDebNFan[i] + ':</b> ' + groupDebNFan[i + 1] + '\n';
  }

  groupDescription += '<b>Members:</b>\n';

  $('.name a').each((i, el) => {
    groupDescription += ' <code>' + $(el).text() + '</code>\n';
  });

  return [idolPicLink[0], groupDescription];
};

export const sendGroup = async (command: string): Promise<result> => {
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
