const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const glob = require('glob')
const fs = require('fs')
const https = require('https')
const cookieSession = require('cookie-session')
const Agenda = require('agenda')
const Agendash = require('agendash')
const path = require('path')
const cookieParser = require('cookie-parser')
const job = require("./routes/job");
const VAULT = require('node-module-vault')
const logger = require('log4js').getLogger()
const vault = new VAULT(process.env.VAULT_RID, process.env.VAULT_SID,process.env.VAULT_ADDR)
logger.level = 'debug'

function getConfiguration() {
    return new Promise((resolve, reject) => {
        let config = {}
        vault.read(`secret/API/schedulerservice/config`)
            .then((secrets) => {
                config.cookieKey = secrets.cookieKey
                config.app_port = secrets.app_port
                config.elastic_db_addr = secrets.elastic_db_addr
                config.elastic_db_port = secrets.elastic_db_port
                config.mongo_db_addr = secrets.mongo_db_addr
                config.jobs = secrets.jobs.split(',')
                resolve(config)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

function startServer(config) {
    const app = express()
    const agenda = new Agenda({ db: { address: config.mongo_db_addr} })
    app.use('/agendash', Agendash(agenda));
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/job', job);

    app.use(cookieSession({
        name: 'session',
        secret: config.cookieKey
    }))
    app.disable('x-powered-by')
        // Set Agenda Jobs types
    const jobTypes = config.jobs

    jobTypes.forEach(function(job) {
        require('./jobs/' + job)(agenda);
    })
    agenda.on('ready', function() {
        agenda.start();
    })
    // Configured Express and some middleware

    // Set production only middleware
    if (app.get('env') === 'production') {
        // app.use(redactedUser())
        // Local logger for certs
        app.use(function(req, res, next) {
            let cert = req.connection.getPeerCertificate()
            req.session.user = {
                email: cert.subject.emailAddress
            }
            next()
        })
    }

    // Define a simple error handler for any other routes
    app.use(function(req, res, next) {
        res.status(404)
        res.send({
            message: 'Not found'
        })
    })

    // Allow development handler to print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            logger.error(err)
            res.status(err.status || 500)
            res.send({
                message: err.message
            })
        })
    } else {
        // Disable stack trace in production
        app.use(function(err, req, res, next) {
            logger.error(err)
            res.status(err.status || 500)
            res.send({
                message: 'Error'
            })
        })
    }

    // Create servers depending on deployment type
    let server
    let port = config.app_port || '8000'
    app.set('port', port)
        // Set SSL options for prod
    if (app.get('env') === 'production') {
        // Add in production logging and cert checks
        logger.info('Running in production mode.')
        let sslOptions = {
            ca: fs.readFileSync('certs/ca.crt'),
            key: fs.readFileSync('certs/server.key'),
            cert: fs.readFileSync('certs/server.crt'),
            requestCert: true,
            rejectUnauthorized: true
        }
        server = https.createServer(sslOptions, app)
        server.listen(port)
        server.timeout = 900000
        server.on('error', (err) => { logger.error(err) })
        server.on('listening', () => { logger.info(`Main server started on ${port} with TLS`) })

        // Redirect HTTP requests to https
        let httpPort = process.env.HTTP_PORT || '8080'
        let http = express()
        http.use(function(req, res) {
            res.redirect(`https://${req.get('host')}${req.originalUrl}`)
        })
        http.listen(httpPort)
            // Just start without SSL
    } else {
        logger.info('Running in development mode.')
        server = app.listen(port)
        server.timeout = 900000
        server.on('error', (err) => { logger.error(err) })
        server.on('listening', () => { logger.info(`Server started on ${port} without TLS`) })
    }
}

// Get secrets and then start server
getConfiguration()
    .then((config) => {
       startServer(config)
    })
    .catch((err) => {
        console.log(err)
        //logger.error(err)
    })