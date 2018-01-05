"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var component_1 = require("@schematics/angular/component");
var fs = require("fs");
var path = require("path");
var copyRecursiveSync = function (src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    }
    else {
        fs.linkSync(src, dest);
    }
};
var ɵ0 = copyRecursiveSync;
exports.ɵ0 = ɵ0;
function default_1(options) {
    // var pkgJson = require('@angular-devkit/schematics/package.json');
    // var pkgJson1 = require.resolve('@angular-devkit/schematics');
    // console.log(pkgJson.versions, pkgJson1);
    // var loc = require.resolve('@schematics/angular/component');
    // const src = path.join(path.dirname(loc), 'files');
    // const dest = path.join(path.join(__dirname, 'files'));
    // console.log(src);
    // console.log(dest);
    // if (!fs.existsSync(dest)) copyRecursiveSync(src, dest);
    console.log(JSON.stringify(options, null, 2));
    var rule1 = component_1.default(options);
    var rule2 = schematics_1.template({
        'ts': function (s) { return 'ts'; }
    });
    var rule3 = function (host, context) {
        console.log(host.exists('apps/frmd/src/app/test/test.component.ts'));
        console.log(JSON.stringify(options, null, 2));
        return host;
    };
    var finalRule = function (host, context) {
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                rule1,
                // rule2,
                rule3,
            ])),
        ])(host, context);
    };
    return finalRule;
}
exports.default = default_1;
