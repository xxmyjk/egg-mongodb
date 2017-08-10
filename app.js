const create = require('./lib/create');

module.exports = app => {
    if (app.config.mongodb.app) {
        app.addSingleton('mongodb', create);
    }
};