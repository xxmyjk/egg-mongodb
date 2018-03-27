const EventEmitter = require('events').EventEmitter;

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const linkDb = Symbol('#linkDb');

let dbProxy = module.exports = class extends EventEmitter {
    constructor(config) {
        super();

        if (!config.host || !config.port || !config.db) {
            let err = new Error('host, port & db is required in config.');

            this.emit('error', err);

            throw err;
        }

        let url = 'mongodb://';

        if (config.username) {
            if (config.password) {
                url += `${config.username}:${config.password}@`;
            } else {
                url += `${config.username}@`;
            }
        }

        url += `${config.hosts}/${config.db}`;

        if (config.query) {
            url += `?${config.query}`;
        }

        this.ObjectId = this.ObjectID = ObjectId;

        this.url = url;
        this[linkDb] = null;
        this.destory = false;
    }

    connect() {
        return MongoClient.connect(this.url).then(db => {
            this[linkDb] = db;

            this.emit('connect');

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

        }).catch(err => this.emit('error', err));
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
};
