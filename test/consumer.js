const kafka = require('node-redacted-kafka')

kafka.start({
  groupId: 'scheduler',
  topics: ['test.sphinx.scheduler.test']
})

kafka.on('ready', () => {
  kafka.on('test.sphinx.scheduler.test', (message) => {
    console.log(new Date() + " " + message)
  })
})
