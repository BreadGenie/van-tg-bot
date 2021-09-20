import { readFileSync } from 'fs';
import TelegramBot = require('node-telegram-bot-api');
import { result, ScrapedIdol, Idol } from '../types';
import { searchGroup } from './group';
import { scrapeIdol } from './idol';
import { SEND_GP, SEND_ID, NO_GP, NO_ID } from '../helpers/strings';
import { matchStringArray } from '../helpers/dice';
import { prettifyReply } from '../helpers/reply';

const waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms));
const asyncForEach = async (array: string | ScrapedIdol[], callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const getMultipleIdols = async (
  query: { query: string; id: string },
  idolResults: string | ScrapedIdol[]
): Promise<TelegramBot.InlineQueryResultArticle[]> => {
  const output = [];
  await asyncForEach(
    idolResults,
    async (idolResult: ScrapedIdol): Promise<void> => {
      await waitFor(50);

      const { picLink, name } = idolResult;
      const groupName = 'group' in idolResult ? idolResult['group'] : '';

      const linkedIdolName = `<a href='${idolResult['picLink']}'>${name}</a>`;
      const idolDescription = prettifyReply(idolResult).replace(
        name,
        linkedIdolName
      );

      output.push({
        type: 'article',
        id: query.id + output.length,
        thumb_url: picLink,
        title: name,
        description: groupName,
        input_message_content: {
          message_text: idolDescription,
          parse_mode: 'HTML',
        },
      });
    }
  );
  return output;
};

const searchIdol = async (
  findIdol: string
): Promise<string | ScrapedIdol[]> => {
  if (findIdol === '') {
    return SEND_ID;
  } else {
    const rawdata = readFileSync('idols.json');
    const idols: Idol[] = JSON.parse(rawdata.toString());

    const idolArray = idols.map(({ idolName }) => idolName);

    const { bestMatch } = matchStringArray(findIdol.toLowerCase(), idolArray, {
      maxBestMatch: 3,
    });

    const matchedIdols = [];
    for (let i = 0; i < bestMatch.length; i++) {
      if (bestMatch[0].diceCoeff > 0.4) {
        matchedIdols.push(idols[bestMatch[i].index]);
      } else return NO_ID;
    }
    return await scrapeIdol(matchedIdols);
  }
};

export const inline = async (
  bot: TelegramBot,
  query: { query: string; id: string }
): Promise<void> => {
  const command = query.query.trim().toLowerCase();
  // const groupResult: result = await searchGroup(command);
  const idolResult = await searchIdol(command);

  // if (groupResult === SEND_GP && idolResult === SEND_ID) {
  //   return;
  // } else if (groupResult !== NO_GP) {
  //   const groupPicLink = groupResult[0];
  //   let groupDescription = groupResult[1];

  //   const groupName = groupDescription
  //     .match(/<b>Group:<\/b> (.*?)\n/g)[0]
  //     .split('<b>Group:</b> ')[1];
  //   const groupLabel = groupDescription.includes('Label')
  //     ? groupDescription
  //         .match(/<b>Label:<\/b> (.*?)\n/g)[0]
  //         .split('<b>Label:</b> ')[1]
  //     : '';

  //   const linkedGroupName =
  //     '<a href="' + groupPicLink + '">' + groupName + '</a>';
  //   groupDescription = groupDescription.replace(groupName, linkedGroupName);

  //   const output: TelegramBot.InlineQueryResultArticle[] = [
  //     {
  //       type: 'article',
  //       id: query.id,
  //       thumb_url: groupPicLink,
  //       title: groupName,
  //       description: groupLabel,
  //       input_message_content: {
  //         message_text: groupDescription,
  //         parse_mode: 'HTML',
  //       },
  //     },
  //   ];

  //   bot.answerInlineQuery(query.id, output);
  // } else
  if (idolResult !== NO_ID && idolResult !== SEND_ID) {
    let output = [];
    // if (typeof idolResult === 'string') {
    // const idolResultArray = idolResult
    //   .replace(/ -/g, '')
    //   .replace('Found Multiple Results:\n\n', '')
    //   .replace('\n\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;', '')
    //   .split('\n');

    output = await getMultipleIdols(query, idolResult);
    // } else {
    //   const { idolPicLink } = idolResult;
    //   let { idolDescription } = idolResult;

    //   const idolName = idolDescription
    //     .match(/<i>(.*?)<\/i>/g)[0]
    //     .split('<i>')[1]
    //     .replace('</i>', '');
    //   const groupName = idolDescription.includes('<b>Group:</b>')
    //     ? idolDescription
    //         .match(/<b>Group:<\/b> (.*?)\n/g)[0]
    //         .split('<b>Group:</b> ')[1]
    //     : '';

    //   const linkedIdolName =
    //     '<a href="' + idolPicLink + '">' + idolName + '</a>';
    //   idolDescription = idolDescription.replace(idolName, linkedIdolName);

    //   output = [
    //     {
    //       type: 'article',
    //       id: query.id,
    //       thumb_url: idolPicLink,
    //       title: idolName,
    //       description: groupName,
    //       input_message_content: {
    //         message_text: idolDescription,
    //         parse_mode: 'HTML',
    //       },
    //     },
    //   ];
    // }

    bot.answerInlineQuery(query.id, output);
  } else {
    await waitFor(1000);
    const output: TelegramBot.InlineQueryResultArticle[] = [
      {
        type: 'article',
        id: query.id,
        title: 'No results found',
        description: 'Tap on me for more info!',
        input_message_content: {
          message_text:
            'Check the search query and ensure it is their proper stage name!',
          parse_mode: 'HTML',
        },
      },
    ];

    bot.answerInlineQuery(query.id, output);
  }
};
