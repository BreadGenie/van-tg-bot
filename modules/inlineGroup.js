const group = require(__dirname + '/group.js');

exports.group = async (bot, query) => {
  const command = { input: "/group " + query.query.toLowerCase() };
  const result = await group.sendGroup(command);
  const notFoundMsg = "Group not found!";

  if (result !== notFoundMsg) {
    let [idolPicLink, groupDescription] = result;

    const groupName = groupDescription.match(/<b>Group:<\/b> (.*?)\n/g)[0].split('<b>Group:<\/b> ')[1];
    const groupLabel = groupDescription.match(/<b>Label:<\/b> (.*?)\n/g)[0].split('<b>Label:<\/b> ')[1];

    const linkedGroupName = '<a href="' + idolPicLink + '">' + groupName + "</a>";
    groupDescription = groupDescription.replace(groupName, linkedGroupName);

    const output = [{
      type: 'article',
      id: query.id,
      thumb_url: idolPicLink,
      title: groupName,
      description: groupLabel,
      input_message_content: {
        message_text: groupDescription,
        parse_mode: 'HTML'
      }
    }];

    bot.answerInlineQuery(query.id, output);
  } else {
    const output = [{
      type: 'article',
      id: query.id,
      title: notFoundMsg,
      description: "Tap on me for more info!",
      input_message_content: {
        message_text: "Check the input and ensure it is the proper stage name!",
        parse_mode: 'HTML'
      }
    }];
    
    bot.answerInlineQuery(query.id, output);
  }
}
