# egg-mongodb

A mongodb adapter for egg.js

## Install

```bash
npm i egg-mongodb --save
```

## Config

add configure in your `config.default.js` or other environment.

```javascript
   module.exports = appInfo => {
        const config = {};

        // add your config here
        config.mongodb = {
            app: true,
            agent: false,
            username: '',
            password: '',
            hosts: '127.0.0.1:27017',
            db: 'test',
            query: '',
            // defalut: {
            //     username: '',
            //     password: '',
            //     hosts: '127.0.0.1:27017',
            //     db: 'test',
            //     query: ''
            // },
            // client: {
            //     username: '',
            //     password: '',
            //     hosts: '127.0.0.1:27017',
            //     db: 'test',
            //     query: ''
            // }
        };

        return config;
   }
```

open this plugin in your `plugin.js` like this.

```javascript
    exports.mongodb = {
        enable: true,
        // feel free to make some local change, and require it like this.
        // path: your_local_folder_path
        package: 'egg-mongodb'
    };
```

The mongodb connect string parse logic is like this.

```javascript
    let url = 'mongodb://';

    if (config.username) {
        if (config.password) {
            url += `${config.username}:${config.password}@`;
        } else {
            url += `${config.username}@`;
        }
    }

    url += `${config.host}:${config.port}/${config.db}`;

    if (config.query) {
        url += `?${config.query}`;
    }
```
Since the [mongodb connection string](https://docs.mongodb.com/manual/reference/connection-string/) is parsed in offical driver, it's no need to define multi clients in egg.js config.


## Usage

After add this plugin in your application, an Object named `mongodb` will be added to the `app instance`. You can access it like this.


In your `controller` file:
```javascript
    'use strict';

    module.exports = app => {
        class UserController extends app.Controller {
            async search() {
                let db = this.app.mongodb;

                let result = await db.collection('user').findOne({
                    // some query here
                    name: 'xxmy'
                }, {
                    name: 1,
                    phone: 1
                });

                this.ctx.body = result;
            }
        }
    }
```

Or in your `service` file:

```javascript
    'use strict';

    module.exports = app => {
        class UserService extends app.Service {
            async register() {
                let db = this.app.mongodb;

                let User = db.collection('user');

                let rs;
                try {
                    let info = await User.insertOne({
                        name: 'zhang san',
                        phone: '177xxxxxxxx'
                    });

                    this.app.logger.log(info);

                    rs = {
                        code: '0',
                        content: 'user register ok'
                    }
                } catch (e) {
                    this.app.logger.error(e && e.stack);

                    rs = {
                        code: '-1',
                        content: e.message || 'unknown error'
                    }
                }

                return rs;
            }
        }

        return UserService;
    };
```

A `mongodb` Object is a fully proxy of original mongodb connection object proxy and contains some suger, constructor like this.

```javascript
    mongodb = {
        ObjectId: 'a copy of mongodb\'s ObjectId function, you can access & make unique id easily',
        ObjectID: 'alias for ObjectId',
        url: 'mongodb connect string parsed from eggjs config',
        destroy: 'flag to mark whether the connection is keep alive',
        connect: 'packaging the MongoClient connect function, SHALL NOT call it manually.',
        '[Symbol]linkDB': 'original db connection Object link, and should be unchangable.',
        collection: 'proxy of original db.collection function'
    }
```

> Notice: `connect` function will be called at start of the app, there is no need to call it manually.


See more detail of constructor [here](https://github.com/xxmyjk/egg-mongodb/blob/master/lib/dbProxy.js#L9);

## Todo & Warn

The `url`, `destroy' and `connect` attribute in `mongodb` instance is useless and may cause some security issues.

AND DO NOT TRY TO EDIT THESE ATTRS MANUALLY.

These problems should be fixed after.

## Thanks To

This package is almost a fully copy from [brickyang](https://github.com/brickyang) \'s  [egg-mongo](https://github.com/brickyang/egg-mongo).
Just removing some unnecessary functions and make it more easy to use.
