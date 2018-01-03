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
var stringUtils = require("@schematics/angular/strings");
var schematics_2 = require("@nrwl/schematics");
var ts = require("typescript");
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var route_utils_1 = require("@schematics/angular/utility/route-utils");
var fileutils_1 = require("../utility/fileutils");
var ast_utils_2 = require("../utility/ast-utils");
var common_1 = require("../utility/common");
function addBootstrap(path) {
    return function (host) {
        var modulePath = path + "/app/app.module.ts";
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'BrowserModule', '@angular/platform-browser')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, 'BrowserModule'), ast_utils_1.addBootstrapToModule(sourceFile, modulePath, 'AppComponent', './app.component')));
        return host;
    };
}
function addNxModule(path) {
    return function (host) {
        var modulePath = path + "/app/app.module.ts";
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'NxModule', '@nrwl/nx')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, 'NxModule.forRoot()')));
        return host;
    };
}
function addAppToAngularCliJson(options) {
    return function (host) {
        if (!host.exists('.angular-cli.json')) {
            throw new Error('Missing .angular-cli.json');
        }
        var sourceText = host.read('.angular-cli.json').toString('utf-8');
        var json = JSON.parse(sourceText);
        json.apps = fileutils_1.addApp(json.apps, {
            name: options.fullName,
            root: options.fullPath,
            outDir: "dist/apps/" + options.fullName,
            assets: ['assets', 'favicon.ico'],
            index: 'index.html',
            main: 'main.ts',
            polyfills: 'polyfills.ts',
            test: common_1.offsetFromRoot(options.fullPath) + "test.js",
            tsconfig: "tsconfig.app.json",
            testTsconfig: common_1.offsetFromRoot(options.fullPath) + "tsconfig.spec.json",
            prefix: options.prefix,
            styles: ["styles." + options.style],
            scripts: [],
            environmentSource: 'environments/environment.ts',
            environments: {
                dev: 'environments/environment.ts',
                prod: 'environments/environment.prod.ts'
            }
        });
        json.lint = (json.lint || []).concat([
            {
                project: options.fullPath + "/tsconfig.app.json",
                exclude: '**/node_modules/**'
            },
            {
                project: "apps/" + options.fullName + "/e2e/tsconfig.e2e.json",
                exclude: '**/node_modules/**'
            }
        ]);
        host.overwrite('.angular-cli.json', fileutils_1.serializeJson(json));
        return host;
    };
}
function addRouterRootConfiguration(path) {
    return function (host) {
        var modulePath = path + "/app/app.module.ts";
        var moduleSource = host.read(modulePath).toString('utf-8');
        var sourceFile = ts.createSourceFile(modulePath, moduleSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, modulePath, [
            route_utils_1.insertImport(sourceFile, modulePath, 'RouterModule', '@angular/router')
        ].concat(schematics_2.addImportToModule(sourceFile, modulePath, "RouterModule.forRoot([], {initialNavigation: 'enabled'})")));
        var componentSpecPath = path + "/app/app.component.spec.ts";
        var componentSpecSource = host.read(componentSpecPath).toString('utf-8');
        var componentSpecSourceFile = ts.createSourceFile(componentSpecPath, componentSpecSource, ts.ScriptTarget.Latest, true);
        schematics_2.insert(host, componentSpecPath, [
            route_utils_1.insertImport(componentSpecSourceFile, componentSpecPath, 'RouterTestingModule', '@angular/router/testing')
        ].concat(ast_utils_2.addImportToTestBed(componentSpecSourceFile, componentSpecPath, "RouterTestingModule")));
        return host;
    };
}
var staticComponentContent = "\n<div style=\"text-align:center\">\n  <h1>\n    Welcome to an Angular CLI app built with Nrwl Nx!\n  </h1>\n  <img width=\"300\" src=\"assets/nx-logo.png\">\n</div>\n\n<h2>Nx</h2>\n\nAn open source toolkit for enterprise Angular applications.\n\nNx is designed to help you create and build enterprise grade Angular applications. It provides an opinionated approach to application project structure and patterns.\n\n<h2>Quick Start & Documentation</h2>\n\n<a href=\"https://nrwl.io/nx\">Watch a 5-minute video on how to get started with Nx.</a>";
function updateComponentTemplate(options) {
    return function (host) {
        var content = options.routing
            ? staticComponentContent + "\n<router-outlet></router-outlet>"
            : staticComponentContent;
        host.overwrite(options.fullPath + "/app/app.component.html", content);
    };
}
function default_1(schema) {
    var npmScope = schema.npmScope;
    if (!npmScope) {
        npmScope = fileutils_1.readCliConfigFile().project.npmScope;
    }
    var options = normalizeOptions(schema);
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(__assign({ utils: stringUtils, dot: '.', tmpl: '', offsetFromRoot: common_1.offsetFromRoot(options.fullPath) }, options, { npmScope: npmScope }))
    ]);
    var selector = options.prefix + "-root";
    return schematics_1.chain([
        schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])),
        schematics_1.externalSchematic('@schematics/angular', 'module', {
            name: 'app',
            commonModule: false,
            flat: true,
            routing: false,
            sourceDir: options.fullPath,
            spec: false
        }),
        schematics_1.externalSchematic('@schematics/angular', 'component', {
            name: 'app',
            selector: selector,
            sourceDir: options.fullPath,
            flat: true,
            inlineStyle: options.inlineStyle,
            inlineTemplate: options.inlineTemplate,
            spec: !options.skipTests,
            styleext: options.style,
            viewEncapsulation: options.viewEncapsulation,
            changeDetection: options.changeDetection
        }),
        updateComponentTemplate(options),
        addBootstrap(options.fullPath),
        addNxModule(options.fullPath),
        addAppToAngularCliJson(options),
        options.routing ? addRouterRootConfiguration(options.fullPath) : schematics_1.noop()
    ]);
}
exports.default = default_1;
function normalizeOptions(options) {
    var name = schematics_2.toFileName(options.name);
    var fullName = options.directory ? schematics_2.toFileName(options.directory) + "/" + name : name;
    var fullPath = "apps/" + fullName + "/" + options.sourceDir;
    return __assign({}, options, { name: name, fullName: fullName, fullPath: fullPath });
}
