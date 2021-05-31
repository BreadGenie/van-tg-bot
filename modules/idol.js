const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const strings = require('../helpers/strings');

const scrapeIdol = async (foundIdol) => {
  const result = await fetch(foundIdol[0].idolLink);
  const body = await result.text();

  $ = cheerio.load(body);

  const foundCSS = $('#content-wrap > style').html();
  const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
  let idolDescription = "<u>Idol</u>\n\n<i>" + $('.profile-top > h2').text() + "</i>\n\n";

  if ($('.profile-top > span').text() !== '') {
    idolDescription += "<b>Group:</b> " + $('.profile-top > span').text() + "\n";
  }

  let idolDesc = [];

  $('.half p').each((i, el) => {
    idolDesc.push($(el).prev().text());
    idolDesc.push($(el).text());
  });

  for (var i = 0; i < idolDesc.length; i += 2) {
    idolDescription += "<b>" + idolDesc[i] + ":</b> " + idolDesc[i + 1] + "\n";
  }

  $('.full p').each((i, el) => {
    idolDesc.push($(el).prev().text());
    idolDesc.push($(el).text());
  });

  if (idolDesc[idolDesc.length - 2] === 'SNS') {
    idolDescription += "<b>" + idolDesc[idolDesc.length - 4] + ":</b> " + idolDesc[idolDesc.length - 3];
  } else {
    idolDescription += "<b>" + idolDesc[idolDesc.length - 2] + ":</b> " + idolDesc[idolDesc.length - 1];
  }

  return ([idolPicLink[0], idolDescription]);
};

exports.sendIdol = async (command) => {
  let findIdol = '';
  let findIdolGroup = '';
  if (command === '') {
    return (strings.SEND_ID);
  } else {
    if (command.includes('"')) {
      findIdol = command.match(/(?<=")(.*?)(?=")/g)[0];
      if (command.includes('" ')) {
        findIdolGroup = command.replace(`"${findIdol}" `, "").toLowerCase();
        findIdol = findIdol.toLowerCase();
      } else {
        findIdol = findIdol.toLowerCase();
        findIdolGroup = undefined;
      }
    } else {
      if (command.includes(" ")) {
        findIdol = command.split(" ")[0].toLowerCase();
        findIdolGroup = command.split(" ")[1].toLowerCase();
      } else {
        findIdol = command.toLowerCase();
        findIdolGroup = undefined;
      }
    }

    const rawdata = fs.readFileSync('./data/idols.json');
    const idols = JSON.parse(rawdata);

    if (findIdolGroup === undefined) {
      const foundIdol = idols.filter(idol => idol.idolName === findIdol);
      if (foundIdol.length > 0) {
        if (foundIdol.length === 1) {
          return (await scrapeIdol(foundIdol));
        } else {
          let foundIdols = 'Found Multiple Results:\n\n';
          foundIdol.forEach(idol => {
            foundIdols += idol.idolName.charAt(0).toUpperCase() + idol.idolName.slice(1) + " - " + idol.idolGroup.toUpperCase() + "\n";
          });
          foundIdols += "\nUse /idol &lt;idol-name&gt; &lt;group-name&gt;"
          return (foundIdols);
        }
      } else {
        return strings.NO_ID;
      }
    } else {
      const foundIdol = idols.filter(idol => idol.idolName === findIdol && idol.idolGroup === findIdolGroup);
      if (foundIdol.length > 0) {
        return (await scrapeIdol(foundIdol));
      } else {
        return strings.NO_ID;
      }
    }
  }
}
