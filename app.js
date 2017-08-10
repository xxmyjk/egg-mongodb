const mongodb = require('./lib/mongodb');

module.exports = app => {
    if (app.config.mongodb) {
        mongodb(app);
    }
};