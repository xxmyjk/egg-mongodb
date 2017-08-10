/**
 * mongodb factory adapter
 **/

const EventEmitter = require('events').EventEmitter;
const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const linkDb = Symbol('#linkDb');

let Caches = null;

class dbProxy extends EventEmitter {
    constructor(db, logger) {
        super();

        this[linkDb] = db;
        this.destory = false;

        db.on('reconnect', err => {
            this.emit('reconnect', err || null);
        });

        db.on('close', err => {
            if (err) {
                this.emit('error', err);
            }

            this.emit('close', err);

            this[linkDb] = null;
            this.destory = true;
        });

        db.on('error', err => {
            this.emit('error', err);

            db.close();

            this[linkDb] = null;
        });
    }

    collection(name) {
        if (this.destory) {
            let err = new Error('db proxy has been destroyed.');

            return this.emit('error', err);
        }

        return this[linkDb].collection(name);
    }

    close() {
        return this[linkDb].close();
    }
}

async function createClient(config, app) {
    if (Caches) {
        return Caches;
    }

    let db;

    if (typeof config !== 'string') {
        let e = new Error('mongodb config should be a string, see https://docs.mongodb.com/manual/reference/connection-string/');
        app.coreLogger.error(`[egg-mongodb] ${e && e.stack}`);

        throw e;
    }

    try {
        db = await MongoClient.connect(config);
    } catch (e) {
        app.coreLogger.error(e);

        throw (e);
    }

    let proxy = new dbProxy(db);


    proxy.ObjectId = proxy.ObjectID = ObjectId;

    proxy.on('reconnect', err => {
        err && app.coreLogger.error(`[egg-mongodb] db connect error & auto reconnected. ${err && err.stack}`);

        app.coreLogger.warn(`[egg-mongodb] db reconnected.`);
    });

    proxy.on('close', err => {
        if (err) {
            app.coreLogger.error(`[egg-mongodb] db closed with error. ${err && err.stack}`);
        } else {
            app.coreLogger.warn(`[egg-mongodb] db closed manually.`);
        }

        Caches = null;

        app.coreLogger.warn('remove db connect caches');
    });

    return Caches = proxy;
}

module.exports = app => {
    app.addSingleton('mongodb', createClient);
};