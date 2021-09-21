import cheerio from 'cheerio';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { SEND_ID, NO_ID } from '../helpers/strings';
import { Idol, ScrapedIdol } from '../types';
import { matchStringArray } from '../helpers/dice';

export const scrapeIdol = async (
  foundIdols: Idol[]
): Promise<ScrapedIdol[]> => {
  const scrapedIdols: ScrapedIdol[] = [];

  for (let i = 0; i < foundIdols.length; i++) {
    const result = await fetch(foundIdols[i].idolLink);
    const body = await result.text();

    const $ = cheerio.load(body);

    const foundCSS = $('#content-wrap > style').html();
    const picLink = foundCSS.match(/https(.*?)(jpg|png)/g)[0];

    const scrapedIdol: ScrapedIdol = {
      picLink,
      name: $('.profile-top > h2').text(),
    };

    if ($('.profile-top .group').text() !== '')
      scrapedIdol.group = $('.profile-top span').first().text();

    $('.half p').each((i, el) => {
      scrapedIdol[$(el).prev().text().toLowerCase()] = $(el).text();
    });

    $('.full p').each((i, el) => {
      scrapedIdol[$(el).prev().text().toLowerCase()] = $(el).text();
    });

    scrapedIdol['diceCoeff'] = foundIdols[i]['diceCoeff'];

    scrapedIdols.push(scrapedIdol);
  }

  return scrapedIdols;
};

export const searchIdol = async (
  findIdol: string
): Promise<string | ScrapedIdol> => {
  if (findIdol === '') {
    return SEND_ID;
  } else {
    const rawdata = readFileSync('idols.json');
    const idols: Idol[] = JSON.parse(rawdata.toString());

    const idolArray = findIdol.includes(' ')
      ? idols.map(({ idolName, idolGroup }) =>
          `${idolName} ${idolGroup}`.trim()
        )
      : idols.map(({ idolName }) => idolName.trim());

    const { bestMatch } = matchStringArray(findIdol.toLowerCase(), idolArray, {
      maxBestMatch: 4,
    });

    const i = 0;
    if (bestMatch[i].diceCoeff !== bestMatch[i + 1].diceCoeff) {
      bestMatch.splice(i + 1, 1);
      if (bestMatch[i].diceCoeff !== bestMatch[i + 1].diceCoeff) {
        bestMatch.splice(i + 1, 1);
      }
    }

    if (bestMatch[0].diceCoeff > 0.5) {
      if (bestMatch.length !== 1) {
        let multGrpMsg = 'Found Multiple Results:\n\n';
        bestMatch.forEach((match) => {
          multGrpMsg += `${idols[match.index].idolName
            .charAt(0)
            .toUpperCase()}${idols[match.index].idolName.slice(1)} - ${idols[
            match.index
          ].idolGroup.toUpperCase()}\n`;
        });
        return `${multGrpMsg}\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;`;
      }

      const foundIdol = idols[bestMatch[0].index];
      const idolResult = await scrapeIdol([foundIdol]);
      return idolResult[0];
    } else {
      return NO_ID;
    }
  }
};
