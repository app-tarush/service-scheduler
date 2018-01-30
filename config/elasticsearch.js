const elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client(
    {
        host: process.env.ES_HOST + ':' + process.env.ES_PORT,
        log: 'trace'
    }
);

exports.createIndex = function (indexName) {
  return client.indices.create({
      index : indexName
  })
};

exports.addDocument = function (indexName, type, data) {
  return client.index({
      index: indexName,
      type: type,
      body: data
  })
};

exports.indexExists = function (indexName) {
    return client.indices.exists({
        index: indexName
    })
};

exports.addMapping = function (indexName, type, schema) {
    return client.indices.putMapping({
        index: indexName,
        type: type,
        body: schema
    })
};