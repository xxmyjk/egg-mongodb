const create = require('./lib/create');

module.exports = agent => {
    if (agent.config.mongodb.agent) {
        agent.addSingleton('mongodb', create);
    }
};