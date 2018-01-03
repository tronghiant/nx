"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function updateJsonFile(path, callback) {
    var json = JSON.parse(fs.readFileSync(path, 'utf-8'));
    callback(json);
    fs.writeFileSync(path, JSON.stringify(json, null, 2));
}
exports.updateJsonFile = updateJsonFile;
function addApp(apps, newApp) {
    if (!apps) {
        apps = [];
    }
    apps.push(newApp);
    apps.sort(function (a, b) {
        if (a.main && !b.main)
            return -1;
        if (!a.main && b.main)
            return 1;
        if (a.name > b.name)
            return 1;
        return -1;
    });
    return apps;
}
exports.addApp = addApp;
function serializeJson(json) {
    return JSON.stringify(json, null, 2) + "\n";
}
exports.serializeJson = serializeJson;
function cliConfig(host) {
    if (!host.exists('.angular-cli.json')) {
        throw new Error('Missing .angular-cli.json');
    }
    var sourceText = host.read('.angular-cli.json').toString('utf-8');
    return JSON.parse(sourceText);
}
exports.cliConfig = cliConfig;
function readCliConfigFile() {
    return JSON.parse(fs.readFileSync('.angular-cli.json', 'utf-8'));
}
exports.readCliConfigFile = readCliConfigFile;
