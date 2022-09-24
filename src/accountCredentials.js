"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var ACCOUNT_FILE_NAME = 'accounts.txt';
function getAccountCredentials() {
    var lines = (0, fs_1.readFileSync)(ACCOUNT_FILE_NAME, 'utf-8').split('\n');
    return lines.map(function (line) { return ({
        username: line.split(':')[0].trim(), password: line.split(':')[1].trim()
    }); });
}
exports.default = getAccountCredentials;
//# sourceMappingURL=accountCredentials.js.map