"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var affected_apps_1 = require("./affected-apps");
var child_process_1 = require("child_process");
var fs = require("fs");
var path = require("path");
var command = process.argv[2];
var apps;
var rest;
try {
    var p = parseFiles();
    rest = p.rest;
    apps = getAffectedApps(p.files);
}
catch (e) {
    printError(command);
}
switch (command) {
    case 'apps':
        console.log(apps.join(' '));
        break;
    case 'build':
        build(apps, rest);
        break;
    case 'e2e':
        e2e(apps, rest);
        break;
}
function printError(command) {
    console.error("Pass the SHA range, as follows: npm run " + command + ":affected SHA1 SHA2.");
    console.error("Or pass the list of affected files, as follows: npm run " + command + ":affected --files=\"libs/mylib/index.ts,libs/mylib2/index.ts\".");
}
function parseFiles() {
    var args = process.argv.slice(3);
    var dashDashFiles = args.filter(function (a) { return a.startsWith('--files='); })[0];
    if (dashDashFiles) {
        args.splice(args.indexOf(dashDashFiles), 1);
        return { files: parseDashDashFiles(dashDashFiles), rest: args.join(' ') };
    }
    else {
        var withoutShahs = args.slice(2);
        return { files: getFilesFromShash(args[0], args[1]), rest: withoutShahs.join(' ') };
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
function getAffectedApps(touchedFiles) {
    var config = JSON.parse(fs.readFileSync('.angular-cli.json', 'utf-8'));
    var projects = (config.apps ? config.apps : []).map(function (p) {
        return {
            name: p.name,
            isApp: p.root.startsWith('apps/'),
            files: allFilesInDir(path.dirname(p.root))
        };
    });
    return affected_apps_1.affectedApps(config.project.npmScope, projects, function (f) { return fs.readFileSync(f, 'utf-8'); }, touchedFiles);
}
exports.getAffectedApps = getAffectedApps;
function allFilesInDir(dirName) {
    var res = [];
    fs.readdirSync(dirName).forEach(function (c) {
        var child = path.join(dirName, c);
        try {
            if (!fs.statSync(child).isDirectory()) {
                res.push(child);
            }
            else if (fs.statSync(child).isDirectory()) {
                res = res.concat(allFilesInDir(child));
            }
        }
        catch (e) { }
    });
    return res;
}
function build(apps, rest) {
    if (apps.length > 0) {
        console.log("Building " + apps.join(', '));
        apps.forEach(function (app) {
            child_process_1.execSync("ng build " + rest + " -a=" + app, { stdio: [0, 1, 2] });
        });
    }
    else {
        console.log('No apps to build');
    }
}
function e2e(apps, rest) {
    if (apps.length > 0) {
        console.log("Testing " + apps.join(', '));
        apps.forEach(function (app) {
            child_process_1.execSync("ng e2e " + rest + " -a=" + app, { stdio: [0, 1, 2] });
        });
    }
    else {
        console.log('No apps to tst');
    }
}
