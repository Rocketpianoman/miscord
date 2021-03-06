require('colors')
const pkg = require('../package.json')
const request = require('request')
const log = require('npmlog')

module.exports = async () => {
  log.info('updateNotifier', 'Checking for updates...')
  request.get('https://api.github.com/repos/Bjornskjald/miscord/releases/latest', {
    json: true,
    headers: { 'User-Agent': 'Miscord v' + pkg.version }
  }, (err, res, release) => {
    if (err) {
      log.error('updateNotifier', 'Something went wrong')
      log.error('updateNotifier', err)
      return
    }
    log.silly('updateNotifier: release', release)
    if (!release.tag_name) return log.warn('updateNotifier: Couldn\'t check updates', release)
    var latest = release.tag_name.substring(1, release.tag_name.length)
    log.silly('updateNotifier: release tag', release.tag_name)
    log.verbose('updateNotifier: release version', latest)
    log.verbose('updateNotifier: package version', pkg.version)
    if (newer(pkg.version, latest)) console.log(`New version ${latest} available!`.green, `\nChangelog:\n${release.body}`.cyan)
  })
}

// https://stackoverflow.com/a/6832721
function newer (v1, v2) {
  var v1parts = v1.split('.')
  var v2parts = v2.split('.')

  if (!v1parts.every(x => /^\d+$/.test(x)) || !v2parts.every(x => /^\d+$/.test(x))) return false

  v1parts = v1parts.map(Number)
  v2parts = v2parts.map(Number)

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) return false
    if (v1parts[i] === v2parts[i]) continue
    else if (v1parts[i] > v2parts[i]) return false
    else return true
  }
  return v1parts.length !== v2parts.length
}
