import { readFileSync } from 'fs';
import TelegramBot = require('node-telegram-bot-api');
import { ScrapedIdol, Idol, ScrapedGroup, Group } from '../types';
import { scrapeGroup } from './group';
import { scrapeIdol } from './idol';
import { matchStringArray } from '../helpers/dice';
import { prettifyReply } from '../helpers/reply';

const waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms));
const asyncForEach = async (array: string[] | ScrapedIdol[], callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const getInlineResult = async (
  query: { query: string; id: string },
  idolResults: ScrapedIdol[]
): Promise<TelegramBot.InlineQueryResultArticle[]> => {
  const output = [];
  await asyncForEach(
    idolResults,
    async (result: ScrapedIdol): Promise<void> => {
      await waitFor(50);

      const { picLink, name } = result;
      let messageText = '';
      let description = '';
      if ('member' in result) {
        const linkedGroupName = `<a href='${result['picLink']}'>${name}</a>`;
        messageText = prettifyReply(result).replace(name, linkedGroupName);
        description = 'Label' in result ? result['Label'] : '';
      } else {
        description = 'Group' in result ? result['Group'].join(',') : '';

        const linkedIdolName = `<a href='${result['picLink']}'>${name}</a>`;
        messageText = prettifyReply(result).replace(name, linkedIdolName);
      }

      output.push({
        type: 'article',
        id: query.id + output.length,
        thumb_url: picLink,
        title: name,
        description,
        input_message_content: {
          message_text: messageText,
          parse_mode: 'HTML',
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Search Again',
                switch_inline_query_current_chat: query.query,
              },
            ],
          ],
        },
      });
    }
  );
  return output;
};

const searchIdol = async (findIdol: string): Promise<ScrapedIdol[]> => {
  if (findIdol === '') {
    return [];
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
        idols[bestMatch[i].index]['diceCoeff'] = bestMatch[i].diceCoeff;
        matchedIdols.push(idols[bestMatch[i].index]);
      } else return [];
    }
    return await scrapeIdol(matchedIdols);
  }
};

const searchGroup = async (command: string): Promise<ScrapedGroup[]> => {
  if (command === '') {
    return [];
  } else {
    const findGroup: string = command.toLowerCase();

    const rawdata: Buffer = readFileSync('groups.json');
    const groups: Group[] = JSON.parse(rawdata.toString());

    const groupArray = groups.map(({ groupName }) => groupName);

    const { bestMatch } = matchStringArray(findGroup, groupArray, {
      maxBestMatch: 3,
    });

    const matchedGroups = [];
    for (let i = 0; i < bestMatch.length; i++) {
      if (bestMatch[0].diceCoeff > 0.4) {
        groups[bestMatch[i].index]['diceCoeff'] = bestMatch[i].diceCoeff;
        matchedGroups.push(groups[bestMatch[i].index]);
      } else return [];
    }

    return await scrapeGroup(matchedGroups);
  }
};

export const inline = async (
  bot: TelegramBot,
  query: { query: string; id: string }
): Promise<void> => {
  const command = query.query.trim().toLowerCase();
  const matchedGroups = await searchGroup(command);
  const matchedIdols = await searchIdol(command);
  const matches = [...matchedGroups, ...matchedIdols];

  matches.sort((a, b) => {
    return b.diceCoeff - a.diceCoeff;
  });

  const filteredMatches = matches.filter((match) => {
    return match !== undefined;
  });

  if (filteredMatches.length !== 0) {
    const output = await getInlineResult(query, filteredMatches);
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
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Search Again',
                switch_inline_query_current_chat: command,
              },
            ],
          ],
        },
      },
    ];

    bot.answerInlineQuery(query.id, output);
  }
};
