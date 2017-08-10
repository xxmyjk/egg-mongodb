const dbProxy = require('./dbProxy');

let Caches = null;

module.exports = function (config, app) {
    if (Caches) {
        return Caches;
    }

    let proxy = new dbProxy(config);

    proxy.on('connect', () => {
        app.logger.info(`[egg-mongodb] db connected succeeded.`);
    });

    proxy.on('reconnect', err => {
        err && app.logger.error(`[egg-mongodb] db connect error & auto reconnected. %j`, err && err.stack);

        app.logger.warn(`[egg-mongodb] db reconnected.`);
    });

    proxy.on('close', err => {
        if (err) {
            app.logger.error(`[egg-mongodb] db closed with error. %j`, err && err.stack);
        } else {
            app.logger.warn(`[egg-mongodb] db closed manually.`);
        }

        Caches = null;

        app.logger.warn('remove db connect caches');
    });

    app.beforeStart(async() => {
        app.logger.info(`[egg-mongodb] Connecting mongodb, config: %j`, config);

        return await proxy.connect();
    });

    return Caches = proxy;
};