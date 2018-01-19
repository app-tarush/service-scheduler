const kafka = require('node-redacted-kafka')

kafka.start()

kafka.on('ready', () => {
    console.log("Kafka connected")
    var message = {
        type: 'console test',
        interval: '3 minutes',
        data: {
            outputConsoleMessage: 'toodles'
        }
    }
    console.log(message)
    kafka.publish('test.sphinx.scheduler', JSON.stringify(message))

    message = {
        type: 'publishToKafka',
        interval: '1 minutes',
        data: {
            outputKafkaMessage: 'kafka pub test',
            outputKafkaTopic: 'test.sphinx.scheduler.test',
        }
    }
    console.log(message)
    kafka.publish('test.sphinx.scheduler', JSON.stringify(message))

    message = {
        type: 'httpAndPipeToKafka',
        interval: '10 minutes',
        data: {
            inputRequestOptions: {
                url: 'https://beachhouse-api.redacted.rodeo/credentials/password/8====D?limit=1',
                method: 'GET'
            },
            outputKafkaTopic: 'test.sphinx.scheduler.test'
        }
    }
    console.log(message)
    kafka.publish('test.sphinx.scheduler', JSON.stringify(message))
})