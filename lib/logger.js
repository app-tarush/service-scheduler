const log4js = require('log4js')
let logger = log4js.getLogger()

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('DEBUG')
} else {
  logger.setLevel('DEBUG')
}

module.exports = logger
