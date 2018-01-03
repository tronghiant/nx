"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_versions_1 = require("./lib-versions");
var fileutils_1 = require("./fileutils");
function addUpgradeToPackageJson() {
    return function (host) {
        if (!host.exists('package.json'))
            return host;
        var sourceText = host.read('package.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        if (!json['dependencies']) {
            json['dependencies'] = {};
        }
        if (!json['dependencies']['@angular/upgrade']) {
            json['dependencies']['@angular/upgrade'] = json['dependencies']['@angular/core'];
        }
        if (!json['dependencies']['angular']) {
            json['dependencies']['angular'] = lib_versions_1.angularJsVersion;
        }
        host.overwrite('package.json', fileutils_1.serializeJson(json));
        return host;
    };
}
exports.addUpgradeToPackageJson = addUpgradeToPackageJson;
function offsetFromRoot(fullPathToSourceDir) {
    var parts = fullPathToSourceDir.split('/');
    var offset = '';
    for (var i = 0; i < parts.length; ++i) {
        offset += '../';
    }
    return offset;
}
exports.offsetFromRoot = offsetFromRoot;
