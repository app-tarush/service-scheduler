var agenda = require("../config/agenda");
const api = require('axios');
var es = require("../config/elasticsearch");
const dateTime = require('date-time');

var Metric = function (id, data) {
    this.timestamp = dateTime({local: false});
    this.id = id;
    this.data = data;
};

function metricCollector(job) {
    api.get(job.attrs.data.url, {
        headers: {
            'accept': 'application/json',
            'accept-language': 'en_US',
            'content-type': 'application/json'
        }
    }).then(function (response) {
        var metric = new Metric(job.attrs._id, response.data);
        var indexName = job.attrs.data.index;
        var type = job.attrs.data.type;
        es.indexExists(indexName).then(function (exists) {
            if (!exists) {
                return es.createIndex(indexName).then(function () {
                    var mapping = JSON.parse(job.attrs.data.responseSchemaMapping);
                    if (Object.keys(mapping).length === 0) {
                        console.log("response schema mapping not defined!");
                    } else {
                        es.addMapping(indexName, type, mapping);
                    }
                });
            }
        }).then(function () {
            return es.addDocument(indexName, type, metric);
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
}

exports.schedule = function (req, res) {
    agenda.define(req.body.jobName, function (job) {
        job.attrs.data = req.body;
        metricCollector(job);
    });
    agenda.every(req.body.frequency, req.body.jobName);
    res.sendStatus(201);
};

exports.scheduleOnce = function (req, res) {
    agenda.define(req.body.jobName, function (job) {
        job.attrs.data = req.body;
        metricCollector(job);
    });
    agenda.schedule(req.body.frequency, req.body.jobName);
    res.sendStatus(201);
};

exports.scheduleNow = function (req, res) {
    agenda.define(req.body.jobName, function (job) {
        job.attrs.data = req.body;
        metricCollector(job);
    });
    agenda.now(req.body.jobName);
    res.sendStatus(201);
};

exports.jobs = function (req, res) {
    agenda.jobs({}, function (err, jobs) {
        try {
            var details = {jobNames: []};
            for (var index = 0; index < jobs.length; index++) {
                details.jobNames.push(jobs[index].attrs.name);
            }
            res.json(details);
        } catch (e) {
            res.status(400).send(err);
        }
    })
};

exports.findJob = function (req, res) {
    agenda.jobs({name: req.params.name}, function (err, jobs) {
        try {
            res.json(jobs[0].attrs);
        } catch (e) {
            res.status(400).send("Error occurred while executing the request")
        }
    })
};

exports.cancel = function (req, res) {
    agenda.cancel({name: req.params.name}, function (err, numRemoved) {
        try {
            if (numRemoved > 0) {
                res.send({msg: "Successfully cancelled the job"})
            } else if (numRemoved === 0) {
                res.send({msg: "No job to be cancelled! Not found it."})
            }
        } catch (e) {
            res.status(400).send(err);
        }
    })
};