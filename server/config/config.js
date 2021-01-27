"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    /**
     * This skeleton file works as a template.
     * Copy this file ill in the information in the mysqlOptions-object and save it as a typescript file: "config.ts"
     * Don't forget to compile it into JavaScript after saving. The name of the file should not be touched!
     * It is marked to be ignored by git since it is a system-specific configuration and should
     * not be overwritten by other team members.
     * You can remove this comment from the ts file afterwards.


*/
    //Verbindung zu Datenbank aufbauen
    Config.mysqlOptions = {
        database: "webp2",
        host: "localhost",
        user: "root",
    };
    Config.sessionOptions = {
        cookie: {
            expires: new Date(Date.now() + (1000 * 60 * 60 * 3)),
        },
        name: 'connect.sid',
        rolling: true,
        saveUninitialized: true,
        resave: true,
        secret: Math.random().toString(),
    };
    return Config;
}());
exports.Config = Config;
//# sourceMappingURL=config.js.map