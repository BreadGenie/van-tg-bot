exports.help = (bot, msg) => {
  bot.sendMessage(msg.chat.id, "Hey, I am Van.\nA K-Pop DB Telegram bot!\n\nUse /group &lt;group-name&gt; to query a Group\n\nUse /idol &lt;idol-name&gt to query an Idol", {
    parse_mode: "HTML"
  })
}
