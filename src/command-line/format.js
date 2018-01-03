"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var command = process.argv[2];
var files = parseFiles();
switch (command) {
    case 'write':
        write(files);
        break;
    case 'check':
        check(files);
        break;
}
function parseFiles() {
    var args = process.argv.slice(3);
    if (args.length === 0) {
        return '"{apps,libs}/**/*.ts"';
    }
    var dashDashFiles = args.filter(function (a) { return a.startsWith('--files='); })[0];
    if (dashDashFiles) {
        args.splice(args.indexOf(dashDashFiles), 1);
        return "\"" + parseDashDashFiles(dashDashFiles).join(',') + "\"";
    }
    else {
        var withoutShahs = args.slice(2);
        return "\"" + getFilesFromShash(args[0], args[1]).join(',') + "\"";
    }
}
function parseDashDashFiles(dashDashFiles) {
    var f = dashDashFiles.substring(8); // remove --files=
    if (f.startsWith('"') || f.startsWith("'")) {
        f = f.substring(1, f.length - 1);
    }
    return f.split(',').map(function (f) { return f.trim(); });
}
function getFilesFromShash(sha1, sha2) {
    return child_process_1.execSync("git diff --name-only " + sha1 + " " + sha2)
        .toString('utf-8')
        .split('\n')
        .map(function (a) { return a.trim(); })
        .filter(function (a) { return a.length > 0; });
}
function write(files) {
    child_process_1.execSync("node ./node_modules/prettier/bin/prettier.js --single-quote --print-width 120 --write " + files, {
        stdio: [0, 1, 2]
    });
}
function check(files) {
    try {
        child_process_1.execSync("node ./node_modules/prettier/bin/prettier.js --single-quote --print-width 120 --list-different " + files, {
            stdio: [0, 1, 2]
        });
    }
    catch (e) {
        process.exit(1);
    }
}
