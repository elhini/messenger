var APIBase = require('./base');

class SessionsAPI extends APIBase {
    constructor(app, db) {
        super(db, 'sessions');
        this.methods = {
            ...this.methods
        };
        this.init(app);
    }
}

module.exports = SessionsAPI;