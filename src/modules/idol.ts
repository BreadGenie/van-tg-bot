import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { SEND_ID, NO_ID } from '../helpers/strings';
import { Idol, result } from '../types';
import { matchStringArray } from '../helpers/dice';

const scrapeIdol = async (foundIdol: Idol) => {
  const result = await fetch(foundIdol.idolLink);
  const body = await result.text();

  const $ = cheerio.load(body);

  const foundCSS = $('#content-wrap > style').html();
  const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
  let idolDescription =
    '<u>Idol</u>\n\n<i>' + $('.profile-top > h2').text() + '</i>\n\n';

  if ($('.profile-top .group').text() !== '') {
    idolDescription +=
      '<b>Group:</b> ' + $('.profile-top span').first().text() + '\n';
  }

  const idolDesc = [];

  $('.half p').each((i, el) => {
    idolDesc.push($(el).prev().text());
    idolDesc.push($(el).text());
  });

  for (let i = 0; i < idolDesc.length; i += 2) {
    idolDescription += '<b>' + idolDesc[i] + ':</b> ' + idolDesc[i + 1] + '\n';
  }

  $('.full p').each((i, el) => {
    idolDesc.push($(el).prev().text());
    idolDesc.push($(el).text());
  });

  if (idolDesc[idolDesc.length - 2] === 'SNS') {
    idolDescription +=
      '<b>' +
      idolDesc[idolDesc.length - 4] +
      ':</b> ' +
      idolDesc[idolDesc.length - 3];
  } else {
    idolDescription +=
      '<b>' +
      idolDesc[idolDesc.length - 2] +
      ':</b> ' +
      idolDesc[idolDesc.length - 1];
  }

  return [idolPicLink[0], idolDescription];
};

export const searchIdol = async (findIdol: string): Promise<result> => {
  if (findIdol === '') {
    return SEND_ID;
  } else {
    const rawdata = readFileSync('idols.json');
    const idols: Idol[] = JSON.parse(rawdata.toString());

    const idolArray = idols.map(({ idolName }) => idolName);

    const { bestMatch } = matchStringArray(findIdol.toLowerCase(), idolArray, {
      maxBestMatch: 3,
    });

    if (bestMatch[0].diceCoeff > 0.4) {
      const foundIdol = idols[bestMatch[0].index];
      return await scrapeIdol(foundIdol);
    } else {
      return NO_ID;
    }
  }
};
