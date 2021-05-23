const cheerio = require('cheerio');
const fetch = require('node-fetch');

const scrapeIdol = async (foundIdol) => {
  const result = await fetch(foundIdol[0].idolLink);
  const body = await result.text();

  $ = cheerio.load(body);

  const foundCSS = $('#content-wrap').children('style').html();
  const idolPicLink = foundCSS.match(/https(.*?)(jpg|png)/g);
  let idolDescription = "<u>Idol</u>\n\n<i>" + $('.profile-top > h2').text() + "</i>\n\n";

  if ($('.profile-top').children('span').text() !== '') {
    idolDescription += "<b>Group:</b> " + $('.profile-top').children('span').text() + "\n";
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

const idolNotFound = async () => {
  return ("Idol not found!\nPlease check your spelling and make sure the given name is a <b>Stage Name</b>");
};

exports.sendIdol = async (command) => {
  let findIdol = '';
  let findIdolGroup = '';
  if (command.input === '/idol') {
    return ("Send Idol Name!");
  } else {
    if (command.input.includes('"')) {
      findIdol = command.input.match(/(?<=")(.*?)(?=")/g)[0];
      if (command.input.includes('" ')) {
        findIdolGroup = command.input.split(" ")[command.input.split(" ").length - 1].toLowerCase();
        findIdol = findIdol.toLowerCase();
      } else {
        findIdol = findIdol.toLowerCase();
        findIdolGroup = undefined;
      }
    } else {
      findIdol = command.input.split("/idol ")[1];
      if (findIdol.includes(" ")) {
        findIdolGroup = findIdol.split(" ")[1].toLowerCase();
        findIdol = findIdol.split(" ")[0].toLowerCase();
      } else {
        findIdol = findIdol.toLowerCase();
        findIdolGroup = undefined;
      }
    }

    const result = await fetch('https://www.kpopmap.com/kpop-profile/');
    const body = await result.text();

    $ = cheerio.load(body);
    let idols = [];

    $('.name > a').each((i, el) => {
      idols.push({
        idolName: $(el).text().toLowerCase(),
        idolGroup: $(el).next().text().toLowerCase(),
        idolLink: $(el).attr('href')
      });
    });

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
        return (await idolNotFound());
      }
    } else {
      const foundIdol = idols.filter(idol => idol.idolName === findIdol && idol.idolGroup === findIdolGroup);
      if (foundIdol.length > 0) {
        return (await scrapeIdol(foundIdol));
      } else {
        return (await idolNotFound());
      }
    }
  }
}
