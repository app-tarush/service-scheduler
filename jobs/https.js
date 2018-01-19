const request = require('request')
const logger = require('../lib/logger')

function getConfiguration() {
    return new Promise((resolve, reject) => {
        let config = {}
        config.certificate = ""
        config.passphrase = ""
        resolve(config)
    })
    .catch((err) => {
        reject(err)
    })
}

module.exports = function(agenda) {
    getConfiguration()
        .then((config) => {
            agenda.define('httpAndPipeToHttp', (job, done) => {
                logger.debug(new Date() + " - schedule - httpAndPipeToHttp - " + job.attrs.data);
                job.attrs.data.inputRequestOptions.pfx = config.certificate
                job.attrs.data.inputRequestOptions.passphrase = config.password
                job.attrs.data.inputRequestOptions.rejectUnauthorized = false
                job.attrs.data.outputRequestOptions.pfx = config.certificate
                job.attrs.data.outputRequestOptions.passphrase = config.password
                job.attrs.data.outputRequestOptions.rejectUnauthorized = false
                request(job.attrs.data.inputRequestOptions)
                    .on('error', (err) => {
                        logger.error(err)
                    })
                    .on('response', (response) => {
                        logger.debug('httpAndPipeToHttp - ' + response.statusCode + ' - ' + response.headers['content-type'])
                    })
                    .pipe(request(job.attrs.data.outputRequestOptions))
                done();
            })
        }).catch((err) => {
            logger.error(err)
        })
}