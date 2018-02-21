const elasticsearch = require('elasticsearch')
const VAULT = require('node-module-vault')
const vault = new VAULT(process.env.VAULT_RID, process.env.VAULT_SID,process.env.VAULT_ADDR)
let config = {}
vault.read(`secret/API/schedulerservice/config`)
    .then((secrets) => {
        config.elastic_db_addr = JSON.parse(secrets.elastic_db_addr)
        var client = new elasticsearch.Client({
            hosts: config.elastic_db_addr,
            log: 'error'
        })

        exports.createIndex = function (indexName) {
            return client.indices.create({
                index : indexName
             })
        }

        exports.addDocument = function (indexName, type, data) {
            return client.index({
                index: indexName,
                type: type,
                body: data
            })
        }

        exports.indexExists = function (indexName) {
            return client.indices.exists({
                index: indexName
            })
        }

        exports.addMapping = function (indexName, type, schema) {
            return client.indices.putMapping({
                index: indexName,
                type: type,
                body: schema
            })
        }
    })
