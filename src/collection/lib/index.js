"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var schematics_2 = require("@nrwl/schematics");
var path = require("path");
var fileutils_1 = require("../utility/fileutils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var ts = require("typescript");
var ast_utils_1 = require("../utility/ast-utils");
var common_1 = require("../utility/common");
function addLibToAngularCliJson(options) {
    return function (host) {
        var json = fileutils_1.cliConfig(host);
        json.apps = fileutils_1.addApp(json.apps, {
            name: options.fullName,
            root: options.fullPath,
            test: common_1.offsetFromRoot(options.fullPath) + "test.js",
            appRoot: ''
        });
        host.overwrite('.angular-cli.json', fileutils_1.serializeJson(json));
        return host;
    };
}
function addLazyLoadedRouterConfiguration(modulePath) {
    return function (host) {
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'RouterModule', '@angular/router')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, "\n        RouterModule.forChild([ \n        /* {path: '', pathMatch: 'full', component: InsertYourComponentHere} */ \n       ]) ")));
        return host;
    };
}
function addRouterConfiguration(schema, indexFilePath, moduleFileName, modulePath) {
    return function (host) {
        var indexSource = host.read(indexFilePath).toString('utf-8');
        var indexSourceFile = ts.createSourceFile(indexFilePath, indexSource, ts.ScriptTarget.Latest, true);
        var moduleSource = host.read(modulePath).toString('utf-8');
        var moduleSourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        var constName = schematics_2.toPropertyName(schema.name) + "Routes";
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(moduleSourceFile, modulePath, 'RouterModule, Route', '@angular/router')
        ].concat(schematics_2.addImportToModule(moduleSourceFile, modulePath, "RouterModule"), ast_utils_1.addGlobal(moduleSourceFile, modulePath, "export const " + constName + ": Route[] = [];")));
        schematics_2.insert(host, indexFilePath, ast_utils_1.addReexport(indexSourceFile, indexFilePath, moduleFileName, constName).slice());
        return host;
    };
}
function addLoadChildren(schema) {
    return function (host) {
        var json = fileutils_1.cliConfig(host);
        var moduleSource = host.read(schema.parentModule).toString('utf-8');
        var sourceFile = ts.createSourceFile(schema.parentModule, moduleSource, ts.ScriptTarget.Latest, true);
        var loadChildren = "@" + json.project.npmScope + "/" + schematics_2.toFileName(schema.fullName) + "#" + schematics_2.toClassName(schema.name) + "Module";
        schematics_2.insert(host, schema.parentModule, ast_utils_1.addRoute(schema.parentModule, sourceFile, "{path: '" + schematics_2.toFileName(schema.name) + "', loadChildren: '" + loadChildren + "'}").slice());
        var tsConfig = findClosestTsConfigApp(host, schema.parentModule);
        if (tsConfig) {
            var tsConfigAppSource = host.read(tsConfig).toString('utf-8');
            var tsConfigAppFile = ts.createSourceFile(tsConfig, tsConfigAppSource, ts.ScriptTarget.Latest, true);
            var offset_1 = common_1.offsetFromRoot(path.dirname(tsConfig));
            schematics_2.insert(host, tsConfig, ast_utils_1.addIncludeToTsConfig(tsConfig, tsConfigAppFile, "\n    , \"" + offset_1 + "libs/" + schema.fullName + "/index.ts\"\n").slice());
            var e2e = path.dirname(path.dirname(tsConfig)) + "/e2e/tsconfig.e2e.json";
            if (host.exists(e2e)) {
                var tsConfigE2ESource = host.read(e2e).toString('utf-8');
                var tsConfigE2EFile = ts.createSourceFile(e2e, tsConfigE2ESource, ts.ScriptTarget.Latest, true);
                schematics_2.insert(host, e2e, ast_utils_1.addIncludeToTsConfig(e2e, tsConfigE2EFile, "\n    , \"" + offset_1 + "libs/" + schema.fullName + "/index.ts\"\n").slice());
            }
        }
        else {
            // we should warn the user about not finding the config
        }
        return host;
    };
}
function findClosestTsConfigApp(host, parentModule) {
    var dir = path.parse(parentModule).dir;
    if (host.exists(dir + "/tsconfig.app.json")) {
        return dir + "/tsconfig.app.json";
    }
    else if (dir != '') {
        return findClosestTsConfigApp(host, dir);
    }
    else {
        return null;
    }
}
function addChildren(schema) {
    return function (host) {
        var json = fileutils_1.cliConfig(host);
        var moduleSource = host.read(schema.parentModule).toString('utf-8');
        var sourceFile = ts.createSourceFile(schema.parentModule, moduleSource, ts.ScriptTarget.Latest, true);
        var constName = schematics_2.toPropertyName(schema.name) + "Routes";
        var importPath = "@" + json.project.npmScope + "/" + schematics_2.toFileName(schema.fullName);
        schematics_2.insert(host, schema.parentModule, [
            route_utils_1.insertImport(sourceFile, schema.parentModule, constName, importPath)
        ].concat(ast_utils_1.addRoute(schema.parentModule, sourceFile, "{path: '" + schematics_2.toFileName(schema.name) + "', children: " + constName + "}")));
        return host;
    };
}
function updateTsLint(schema) {
    return function (host) {
        var tsLint = JSON.parse(host.read('tslint.json').toString('utf-8'));
        if (tsLint['rules'] &&
            tsLint['rules']['nx-enforce-module-boundaries'] &&
            tsLint['rules']['nx-enforce-module-boundaries'][1] &&
            tsLint['rules']['nx-enforce-module-boundaries'][1]['lazyLoad']) {
            tsLint['rules']['nx-enforce-module-boundaries'][1]['lazyLoad'].push(schematics_2.toFileName(schema.fullName));
            host.overwrite('tslint.json', fileutils_1.serializeJson(tsLint));
        }
        return host;
    };
}
function default_1(schema) {
    var options = normalizeOptions(schema);
    var moduleFileName = schematics_2.toFileName(options.name) + ".module";
    var modulePath = options.fullPath + "/" + moduleFileName + ".ts";
    var indexFile = "libs/" + schematics_2.toFileName(options.fullName) + "/index.ts";
    if (options.routing && options.nomodule) {
        throw new Error("nomodule and routing cannot be used together");
    }
    if (!options.routing && options.lazy) {
        throw new Error("routing must be set");
    }
    var templateSource = schematics_1.apply(schematics_1.url(options.nomodule ? './files' : './ngfiles'), [
        schematics_1.template(__assign({}, schematics_2.names(options.name), { dot: '.', tmpl: '' }, options))
    ]);
    return schematics_1.chain([
        schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])),
        addLibToAngularCliJson(options),
        options.routing && options.lazy ? addLazyLoadedRouterConfiguration(modulePath) : schematics_1.noop(),
        options.routing && options.lazy ? updateTsLint(options) : schematics_1.noop(),
        options.routing && options.lazy && options.parentModule ? addLoadChildren(options) : schematics_1.noop(),
        options.routing && !options.lazy ? addRouterConfiguration(options, indexFile, moduleFileName, modulePath) : schematics_1.noop(),
        options.routing && !options.lazy && options.parentModule ? addChildren(options) : schematics_1.noop()
    ]);
}
exports.default = default_1;
function normalizeOptions(options) {
    var name = schematics_2.toFileName(options.name);
    var fullName = options.directory ? schematics_2.toFileName(options.directory) + "/" + name : name;
    var fullPath = "libs/" + fullName + "/" + options.sourceDir;
    return __assign({}, options, { name: name, fullName: fullName, fullPath: fullPath });
}