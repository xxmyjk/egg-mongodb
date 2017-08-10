const mongodb = require('./lib/mongodb');

module.exports = agent => {
    if (agent.config.mongodb) {
        mongodb(agent);
    }
};