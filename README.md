# WATERWHEEL

A scheduling system capable of being tasked by individuals or software modules that will keep track of what to do
and how often it should be done. This exists to reduce the workload of tasks that currently need to be done
manually, and should address use cases such as:

## `Scheduler` Tasking

Scheduler can consume these task types:
* `httpAndPipeToHttp` - Schedules an HTTP/s operation and pipes the results to another HTTP/s connection.
* `httpAndPipeToKafka` - Schedules an HTTP/s operation and pipes the results to a Kafka topic.
* `publishToKafka` - Schedules a message to be published to a Kafka topic.
* `console test` - Test function to output a message to the console for debugging purposes. 

Full documentation on the task definitions can be viewed [here](https://gitlab.redacted.rodeo/apps/waterwheel/wikis/home).

# To Run Locally

Manually:
```
$ docker run --name mongo:3.6.2 -p 27017:27017 -d mongo
$ npm run dev
```
Smarter:
```
$ docker-compose up
```

Visit browser: http://localhost:8000
