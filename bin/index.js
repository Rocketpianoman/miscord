#!/usr/bin/env node

require('colors')

const minimist = require('minimist')

const sendError = require('../lib/error')
const login = require('../lib/login/login')

const discordListener = require('../lib/listeners/discord')
const messengerListener = require('../lib/listeners/messenger')
const getConfig = require('../lib/config/getConfig')

var args = minimist(process.argv.slice(2))

if (args.h || args.help) {
  console.log(`
Miscord v${require('../package.json').version}

Usage: miscord
  --help    [-h]              ${'shows this message'.cyan}
  --version [-v]              ${'shows version'.cyan}
  --config  [-c] configPath   ${'reads config from custom path'.cyan}

Example:
  miscord -c /path/to/config.json
  miscord -c D:\\Miscord\\config.json
  `)
  process.exit(0)
}

if (args.v || args.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

require('../lib/logger.js')(args.c || args.config)

getConfig(args.c || args.config).then(login).then(() => {
  // when got a discord message
  config.discord.client.on('message', discordListener)

  // when got a messenger message
  config.messenger.stopListening = config.messenger.client.listen(messengerListener)
}).catch(err => sendError(err))

process.on('unhandledRejection', error => {
  if (!error) return
  sendError(error)
})
