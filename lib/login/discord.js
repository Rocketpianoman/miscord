const log = require('npmlog')
const Discord = require('discord.js')
const discord = new Discord.Client()

module.exports = () => {
  // log in to discord
  log.info('login', 'Logging in to Discord...')
  return discord.login(config.discord.token).then(async u => {
    log.silly('login: discord client', discord)
    log.info('login', 'Logged in to Discord')

    // set activity
    discord.user.setActivity('Miscord v' + require('../../package.json').version)

    // if bot isn't added to any guilds, send error
    log.silly('login: guilds', discord.guilds)
    var addUrl = `https://discordapp.com/api/oauth2/authorize?client_id=${discord.user.id}&permissions=537390096&scope=bot`
    if (discord.guilds.size === 0) {
      throw new Error(`No guilds added!
You can add a bot to your guild here:
${addUrl}
It's not an error... unless you added the bot to your guild already.`)
    }

    // set guild as a global variable, if it's specified in arguments then get it by name, if not then get the first one
    config.discord.guild = config.discord.guild ? discord.guilds.find(guild => guild.name === config.discord.guild || guild.id === config.discord.guild) : discord.guilds.first()
    log.silly('login: guild', config.discord.guild)

    // if guild is undefined, send error
    if (!config.discord.guild) throw new Error(`Guild not found!`)
    log.verbose('login', 'Found Discord guild')

    // create a new collection with channels
    config.discord.channels = new Discord.Collection()

    // if user put category name in the config
    if (config.discord.category) {
      // get category
      var category = config.discord.guild.channels.find(channel => (channel.name === config.discord.category || channel.id === config.discord.category) && (channel.type === null || channel.type === 'category'))
      // if category is missing, create a new one
      if (!category) category = await config.discord.guild.createChannel(config.discord.category, 'category')
      log.verbose('login', 'Got Discord category')
      log.silly('login', category)
      config.discord.category = category
    }

    // map every category's channel by topic
    (category ? category.children : config.discord.guild.channels)
      .filter(channel => /^[0-9]+$/.test(channel.topic))
      .forEach(channel => config.discord.channels.set(channel.topic, channel))

    // map each webhook to its channel name
    config.discord.webhooks = (await config.discord.guild.fetchWebhooks()).filter(webhook => webhook.name.startsWith('Miscord #'))

    Object.entries(config.messenger.link).forEach(entry => {
      if (typeof entry[1] === 'string') config.custom[entry[1]] = config.custom[entry[0]]
      else entry[1].forEach(id => { config.custom[id] = config.custom[entry[0]] })
    })

    // handle custom channels
    Object.entries(config.custom).forEach(entry =>
      config.discord.channels.set(entry[0], config.discord.guild.channels.find(el =>
        el.name === entry[1] || el.id === entry[1]
      ))
    )

    log.silly('login: channels', config.discord.channels)

    log.info('login', 'Got Discord channels list')

    discord.on('error', err => log.error('discord', err))

    return discord
  })
}
