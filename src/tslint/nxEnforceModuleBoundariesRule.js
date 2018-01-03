"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var Lint = require("tslint");
var fs_1 = require("fs");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule(options, path, npmScope, appNames) {
        var _this = _super.call(this, options) || this;
        _this.path = path;
        _this.npmScope = npmScope;
        _this.appNames = appNames;
        if (!path) {
            var cliConfig = _this.readCliConfig();
            _this.path = process.cwd();
            _this.npmScope = cliConfig.project.npmScope;
            _this.appNames = cliConfig.apps.map(function (a) { return a.name; });
        }
        return _this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new EnforceModuleBoundariesWalker(sourceFile, this.getOptions(), this.path, this.npmScope, this.appNames));
    };
    Rule.prototype.readCliConfig = function () {
        return JSON.parse(fs_1.readFileSync(".angular-cli.json", 'UTF-8'));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var EnforceModuleBoundariesWalker = /** @class */ (function (_super) {
    __extends(EnforceModuleBoundariesWalker, _super);
    function EnforceModuleBoundariesWalker(sourceFile, options, projectPath, npmScope, appNames) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.projectPath = projectPath;
        _this.npmScope = npmScope;
        _this.appNames = appNames;
        return _this;
    }
    EnforceModuleBoundariesWalker.prototype.visitImportDeclaration = function (node) {
        var _this = this;
        var imp = node.moduleSpecifier.getText().substring(1, node.moduleSpecifier.getText().length - 1);
        var allow = Array.isArray(this.getOptions()[0].allow)
            ? this.getOptions()[0].allow.map(function (a) { return "" + a; })
            : [];
        var lazyLoad = Array.isArray(this.getOptions()[0].lazyLoad)
            ? this.getOptions()[0].lazyLoad.map(function (a) { return "" + a; })
            : [];
        // whitelisted import => return
        if (allow.indexOf(imp) > -1) {
            _super.prototype.visitImportDeclaration.call(this, node);
            return;
        }
        var lazyLoaded = lazyLoad.filter(function (a) { return imp.startsWith("@" + _this.npmScope + "/" + a); })[0];
        if (lazyLoaded) {
            this.addFailureAt(node.getStart(), node.getWidth(), 'import of lazy-loaded libraries are forbidden');
            return;
        }
        if (this.isRelativeImportIntoAnotherProject(imp) || this.isAbsoluteImportIntoAnotherProject(imp)) {
            this.addFailureAt(node.getStart(), node.getWidth(), "library imports must start with @" + this.npmScope + "/");
            return;
        }
        var deepImport = this.appNames.filter(function (a) { return imp.startsWith("@" + _this.npmScope + "/" + a + "/"); })[0];
        if (deepImport) {
            this.addFailureAt(node.getStart(), node.getWidth(), 'deep imports into libraries are forbidden');
            return;
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    EnforceModuleBoundariesWalker.prototype.isRelativeImportIntoAnotherProject = function (imp) {
        if (!this.isRelative(imp))
            return false;
        var sourceFile = this.getSourceFile().fileName.substring(this.projectPath.length);
        var targetFile = path.resolve(path.dirname(sourceFile), imp);
        if (this.workspacePath(sourceFile) && this.workspacePath(targetFile)) {
            if (this.parseProject(sourceFile) !== this.parseProject(targetFile)) {
                return true;
            }
        }
        return false;
    };
    EnforceModuleBoundariesWalker.prototype.isAbsoluteImportIntoAnotherProject = function (imp) {
        return imp.startsWith('libs/') || (imp.startsWith('/libs/') && imp.startsWith('apps/')) || imp.startsWith('/apps/');
    };
    EnforceModuleBoundariesWalker.prototype.workspacePath = function (s) {
        return s.startsWith('/apps/') || s.startsWith('/libs/');
    };
    EnforceModuleBoundariesWalker.prototype.parseProject = function (s) {
        var rest = s.substring(6);
        var r = rest.split(path.sep);
        return r[0];
    };
    EnforceModuleBoundariesWalker.prototype.isRelative = function (s) {
        return s.startsWith('.');
    };
    return EnforceModuleBoundariesWalker;
}(Lint.RuleWalker));
