const Agenda = require("agenda");

var agenda = new Agenda(
    {
        db:
            {
                address: process.env.AGENDA_HOST + ':' + process.env.AGENDA_PORT + '/' + process.env.AGENDA_DB,
                collection: process.env.AGENDA_COLLECTION
            }
    }
);
agenda.start();

module.exports = agenda;