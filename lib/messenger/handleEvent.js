const log = require('npmlog')

const { getThread, getSender, getChannelName, filter } = require('./index')
const { getChannel } = require('../discord')

module.exports = async message => {
  log.silly('handleEvent: event', message)

  // get thread info to know if it's a group conversation (disable cache if event is group rename)
  var thread = await getThread(message.threadID, message.logMessageType !== 'log:thread-name')
  log.verbose('handleEvent', 'Got Messenger thread')
  log.silly('messengerListener: thread', thread)

  // also get sender info
  var sender = await getSender(message.author)
  log.verbose('messengerListener', 'Got user info')
  log.silly('handleEvent: sender', sender)

  var cleanname = getChannelName(thread, sender, message)

  // handle white/blacklist
  if (!filter(cleanname, message.threadID)) return

  var isLinked = Boolean(Object.entries(config.messenger.link).find(entry => entry.includes(message.threadID)))

  var channel = await getChannel({
    name: thread.name,
    topic: message.threadID,
    isLinked
  })
  channel.send(`*${isLinked ? getChannelName(thread, sender, message, false) + ': ' : ''}${message.logMessageBody}*`)
}
