// mongodb connect string
// ref: https://docs.mongodb.com/manual/reference/connection-string/

exports.mongodb = {
    agent:false,
    app:true,
    default: {
        username: null,
        password: null,
        hosts: '127.0.0.1:27017',
        db: 'test',
        query: ''
    },
    client: {
        username: null,
        password: null,
        hosts: '127.0.0.1:27017',
        db: 'test',
        query: ''
    }
};
