function updatePic(bot, msg, arg, source, RandomPic) {
  RandomPic.findOneAndUpdate({
    group: arg
  }, {
    $addToSet: {
      fileID: source.photo[0].file_id,
      fileUniqueID: source.photo[0].file_unique_id
    }
  }, {
    upsert: true
  }, (err, docs) => {
    if (err) {
      console.log(err);
    } else if (docs) {
      if (docs.fileID.includes(source.photo[0].file_id)) {
        bot.sendMessage(msg.chat.id, "Pic already exist in the database! 😌", {
          reply_to_message_id: msg.message_id
        });
      } else {
        bot.sendMessage(msg.chat.id, "Pic added to the database! 👍🏻", {
          reply_to_message_id: msg.message_id
        });
      }
    } else {
      bot.sendMessage(msg.chat.id, "Pic added to the database! 👍🏻", {
        reply_to_message_id: msg.message_id
      });
    }
  });
};

exports.randPic = (bot, msg, command, RandomPic) => {
  let arg = command.input.split("/random ")[1];
  if (arg === undefined) {
    bot.sendMessage(msg.chat.id, "Please send a group Name! 🧐", {
      reply_to_message_id: msg.message_id
    });
  } else {
    arg = arg.toUpperCase();
    RandomPic.findOne({
      group: arg
    }, (err, groupPics) => {
      if (!groupPics || groupPics.fileID.length === 0) {
        bot.sendMessage(msg.chat.id, "Sorry this group's pics are not included yet please contact @Bread_Genie to include them!", {
          reply_to_message_id: msg.message_id
        });
      } else {
        file_id = groupPics.fileID[Math.floor(Math.random() * groupPics.fileID.length)];
        bot.sendPhoto(msg.chat.id, file_id, {
          caption: "#"  + arg,
          reply_to_message_id: msg.message_id
        });
      }
    });
  }
};

exports.setRandPic = (bot, msg, command, RandomPic) => {
  if (msg.from.id === Number(process.env.ADMIN_ID)) {
    let arg = command.input.split("/setrandpic ")[1];
    if (arg === undefined) {
      bot.sendMessage(msg.chat.id, "Please send a group Name! 🧐", {
        reply_to_message_id: msg.message_id
      });
    } else {
      arg = arg.toUpperCase();
      RandomPic.findOne({
        group: arg,
      }, (err, docs) => {
        if (docs && docs.fileUniqueID.includes(msg.reply_to_message.photo[0].file_unique_id)) {
          bot.sendMessage(msg.chat.id, "Pic already exist in the database! 😌", {
            reply_to_message_id: msg.message_id
          });
        } else {
          updatePic(bot, msg, arg, msg.reply_to_message, RandomPic);
        }
      });
    }
  } else {
    if (msg.from.username) {
      userName = "@" + msg.from.username;
    } else if (msg.from.last_name) {
      userName = '<a href="tg://user?id=' + msg.from.id + '>' + msg.from.first_name + ' ' + msg.from.last_name + '</a>';
    } else {
      userName = '<a href="tg://user?id=' + msg.from.id + '>' + msg.from.first_name + '</a>';
    }
    bot.sendMessage(msg.chat.id, "This command is not for you! 😤", {
      reply_to_message_id: msg.message_id
    });
    bot.sendMessage(process.env.ADMIN_ID, userName + " is pestering mee! 😖", {
      reply_to_message_id: msg.message_id
    });
  }
};

exports.groupSetPic = (bot, msg, RandomPic) => {
  const name = msg.chat.title.toUpperCase();
  RandomPic.findOne({
    group: name
  }, (err, docs) => {
    if (docs && docs.fileUniqueID.includes(msg.photo[0].file_unique_id)) {
      bot.sendMessage(msg.chat.id, "Pic already exist in the database! 😌", {
        reply_to_message_id: msg.message_id
      });
    } else {
      updatePic(bot, msg, name, msg, RandomPic);
    }
  });
};

exports.rmRandPic = (bot, msg, command, RandomPic) => {
  if (msg.from.id === Number(process.env.ADMIN_ID) || msg.chat.id === Number(process.env.RANDPIC_CHAT_ID)) {
    let groupName = '';
    if (command.input === "/rmrandpic") {
      groupName = msg.chat.title.toUpperCase();
    } else if (msg.chat.id !== process.env.RANDPIC_CHAT_ID) {
      bot.sendMessage(msg.chat.id, "Enter the group name!", {
        reply_to_message_id: msg.message_id
      });
    } else {
      groupName = command.input.split("/rmrandpic ")[1].toUpperCase();
    }
    RandomPic.findOneAndUpdate({
      group: groupName
    }, {
      $pull: {
        fileID: msg.reply_to_message.photo[0].file_id,
        fileUniqueID: msg.reply_to_message.photo[0].file_unique_id
      }
    }, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        if (docs) {
          if (docs.fileID.includes(msg.reply_to_message.photo[0].file_id)) {
            bot.sendMessage(msg.chat.id, "Pic removed!", {
              reply_to_message_id: msg.message_id
            });
          } else {
            bot.sendMessage(msg.chat.id, "This pic doesn't exist in the database!", {
              reply_to_message_id: msg.message_id
            });
          }
        } else {
          bot.sendMessage(msg.chat.id, "The group doesn't exist in the database!", {
            reply_to_message_id: msg.message_id
          });
        }
      }
    });
  } else {
    bot.sendMessage(msg.chat.id, "This ain't a power mere mortals can hold!", {
      reply_to_message_id: msg.message_id
    });
  }
};
