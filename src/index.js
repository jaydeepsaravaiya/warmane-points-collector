"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var accountCredentials_1 = require("./accountCredentials");
var wowclient_1 = require("./wowclient");
var accounts = (0, accountCredentials_1.default)();
accounts.forEach(function (account) {
    var client = new wowclient_1.default(account);
});
//# sourceMappingURL=index.js.map