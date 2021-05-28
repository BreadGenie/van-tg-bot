const group = require(__dirname + '/group.js');
const idol = require(__dirname + '/idol.js');

exports.group = async (bot, query) => {
  const groupCommand = { input: "/group " + query.query.toLowerCase() };
  const idolCommand = { input: "/idol " + query.query.toLowerCase() };
  const groupResult = await group.sendGroup(groupCommand);
  const idolResult = await idol.sendIdol(idolCommand);

  if (groupResult !== "Group not found!") {
    let [groupPicLink, groupDescription] = groupResult;

    const groupName = groupDescription.match(/<b>Group:<\/b> (.*?)\n/g)[0].split('<b>Group:<\/b> ')[1];
    const groupLabel = groupDescription.match(/<b>Label:<\/b> (.*?)\n/g)[0].split('<b>Label:<\/b> ')[1];

    const linkedGroupName = '<a href="' + groupPicLink + '">' + groupName + "</a>";
    groupDescription = groupDescription.replace(groupName, linkedGroupName);

    const output = [{
      type: 'article',
      id: query.id,
      thumb_url: groupPicLink,
      title: groupName,
      description: groupLabel,
      input_message_content: {
        message_text: groupDescription,
        parse_mode: 'HTML'
      }
    }];

    bot.answerInlineQuery(query.id, output);
  } else if (idolResult !== "Idol not found!\nPlease check your spelling and make sure the given name is a <b>Stage Name</b>") {
    let output = [];
    if (typeof idolResult === 'string') {
      
      output = [{
        type: 'article',
        id: query.id,
        title: "Multiple Results",
        description: "Tap on me for more info!",
        input_message_content: {
          message_text: idolResult.replace("/idol", "@VanBT21_Bot"),
          parse_mode: 'HTML'
        }
      }];
    } else {
      let [idolPicLink, idolDescription] = idolResult;

      const idolName = idolDescription.match(/<i>(.*?)<\/i>/g)[0].split('<i>')[1].replace("<\/i>", "");
      const groupName = idolDescription.match(/<b>Group:<\/b> (.*?)\n/g)[0].split('<b>Group:<\/b> ')[1];

      const linkedIdolName = '<a href="' + idolPicLink + '">' + idolName + "</a>";
      idolDescription = idolDescription.replace(idolName, linkedIdolName);

      output = [{
        type: 'article',
        id: query.id,
        thumb_url: idolPicLink,
        title: idolName,
        description: groupName,
        input_message_content: {
          message_text: idolDescription,
          parse_mode: 'HTML'
        }
      }];
    }

    bot.answerInlineQuery(query.id, output);
  } else {
    const output = [{
      type: 'article',
      id: query.id,
      title: 'No results found',
      description: "Tap on me for more info!",
      input_message_content: {
        message_text: "Check the search query and ensure it is their proper stage name!",
        parse_mode: 'HTML'
      }
    }];

    bot.answerInlineQuery(query.id, output);
  }
}
