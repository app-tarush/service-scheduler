const logger = require('../lib/logger')
module.exports = function(agenda) {
    agenda.define('console test', function(job, done) {
        logger.debug(new Date() + " - scheduler - console test - " + job.attrs.data.outputConsoleMessage);
        done();
    })
}