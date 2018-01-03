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
var ts = require("typescript");
var path = require("path");
function affectedApps(npmScope, projects, fileRead, touchedFiles) {
    projects = normalizeProjects(projects);
    touchedFiles = normalizeFiles(touchedFiles);
    var deps = dependencies(npmScope, projects, fileRead);
    var touchedProjects = touchedFiles.map(function (f) {
        var p = projects.filter(function (project) { return project.files.indexOf(f) > -1; })[0];
        return p ? p.name : null;
    });
    if (touchedProjects.indexOf(null) > -1) {
        return projects.filter(function (p) { return p.isApp; }).map(function (p) { return p.name; });
    }
    return projects
        .filter(function (p) { return p.isApp && deps[p.name].filter(function (dep) { return touchedProjects.indexOf(dep) > -1; }).length > 0; })
        .map(function (p) { return p.name; });
}
exports.affectedApps = affectedApps;
function normalizeProjects(projects) {
    return projects.map(function (p) {
        return __assign({}, p, { files: normalizeFiles(p.files) });
    });
}
function normalizeFiles(files) {
    return files.map(function (f) { return f.replace(/[\\\/]+/g, '/'); });
}
function dependencies(npmScope, projects, fileRead) {
    return new Deps(npmScope, projects, fileRead).calculateDeps();
}
exports.dependencies = dependencies;
var Deps = /** @class */ (function () {
    function Deps(npmScope, projects, fileRead) {
        this.npmScope = npmScope;
        this.projects = projects;
        this.fileRead = fileRead;
    }
    Deps.prototype.calculateDeps = function () {
        this.deps = this.projects.reduce(function (m, c) {
            return (__assign({}, m, (_a = {}, _a[c.name] = [], _a)));
            var _a;
        }, {});
        this.processAllFiles();
        return this.includeTransitive();
    };
    Deps.prototype.processAllFiles = function () {
        var _this = this;
        this.projects.forEach(function (p) {
            p.files.forEach(function (f) {
                _this.processFile(p.name, f);
            });
        });
    };
    Deps.prototype.includeTransitive = function () {
        var _this = this;
        var res = {};
        Object.keys(this.deps).forEach(function (project) {
            res[project] = _this.transitiveDeps(project);
        });
        return res;
    };
    Deps.prototype.transitiveDeps = function (project) {
        var _this = this;
        var res = [project];
        this.deps[project].forEach(function (d) {
            res = res.concat(_this.transitiveDeps(d));
        });
        return Array.from(new Set(res));
    };
    Deps.prototype.processFile = function (projectName, filePath) {
        if (path.extname(filePath) === '.ts') {
            var tsFile = ts.createSourceFile(filePath, this.fileRead(filePath), ts.ScriptTarget.Latest, true);
            this.processNode(projectName, tsFile);
        }
    };
    Deps.prototype.processNode = function (projectName, node) {
        var _this = this;
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            var imp = this.getStringLiteralValue(node.moduleSpecifier);
            this.addDepIfNeeded(imp, projectName);
        }
        else if (node.kind === ts.SyntaxKind.PropertyAssignment) {
            var name = this.getPropertyAssignmentName(node.name);
            if (name === 'loadChildren') {
                var init = node.initializer;
                if (init.kind === ts.SyntaxKind.StringLiteral) {
                    var childrenExpr = this.getStringLiteralValue(init);
                    this.addDepIfNeeded(childrenExpr, projectName);
                }
            }
        }
        else {
            ts.forEachChild(node, function (child) { return _this.processNode(projectName, child); });
        }
    };
    Deps.prototype.getPropertyAssignmentName = function (nameNode) {
        switch (nameNode.kind) {
            case ts.SyntaxKind.Identifier:
                return nameNode.getText();
            case ts.SyntaxKind.StringLiteral:
                return nameNode.text;
            default:
                return null;
        }
    };
    Deps.prototype.addDepIfNeeded = function (expr, projectName) {
        var _this = this;
        var matchingProject = this.projectNames.filter(function (a) {
            return expr === "@" + _this.npmScope + "/" + a ||
                expr.startsWith("@" + _this.npmScope + "/" + a + "#") ||
                expr.startsWith("@" + _this.npmScope + "/" + a + "/");
        })[0];
        if (matchingProject) {
            this.deps[projectName].push(matchingProject);
        }
    };
    Deps.prototype.getStringLiteralValue = function (node) {
        return node.getText().substr(1, node.getText().length - 2);
    };
    Object.defineProperty(Deps.prototype, "projectNames", {
        get: function () {
            return this.projects.map(function (p) { return p.name; });
        },
        enumerable: true,
        configurable: true
    });
    return Deps;
}());
