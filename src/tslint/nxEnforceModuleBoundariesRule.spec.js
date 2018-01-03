"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var nxEnforceModuleBoundariesRule_1 = require("./nxEnforceModuleBoundariesRule");
describe('Enforce Module Boundaries', function () {
    it('should not error when everything is in order', function () {
        var failures = runRule({ allow: ['@mycompany/mylib/deep'] }, "\n      import '@mycompany/mylib';\n      import '@mycompany/mylib/deep';\n      import '../blah';\n    ");
        expect(failures.length).toEqual(0);
    });
    it('should error on a relative import of a library', function () {
        var failures = runRule({}, "import '../../../libs/mylib';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('library imports must start with @mycompany/');
    });
    it('should error on absolute imports into libraries without using the npm scope', function () {
        var failures = runRule({}, "import 'libs/mylib';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('library imports must start with @mycompany/');
    });
    it('should error about deep imports into libraries', function () {
        var failures = runRule({}, "import '@mycompany/mylib/blah';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('deep imports into libraries are forbidden');
    });
    it('should not error about deep imports when libs contain the same prefix', function () {
        var failures = runRule({}, "import '@mycompany/reporting-dashboard-ui';\n       import '@mycompany/reporting-other';\n       import '@mycompany/reporting';\n       ", ['reporting', 'reporting-dashboard-ui']);
        expect(failures.length).toEqual(0);
        // Make sure it works regardless of order of app names list
        failures = runRule({}, "import '@mycompany/reporting-dashboard-ui';\n       import '@mycompany/reporting-other';\n       import '@mycompany/reporting';", ['reporting-dashboard-ui', 'reporting']);
        expect(failures.length).toEqual(0);
    });
    it('should error on importing a lazy-loaded library', function () {
        var failures = runRule({ lazyLoad: ['mylib'] }, "import '@mycompany/mylib';");
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('import of lazy-loaded libraries are forbidden');
    });
});
function runRule(ruleArguments, content, appNames) {
    if (appNames === void 0) { appNames = ['mylib']; }
    var options = {
        ruleArguments: [ruleArguments],
        ruleSeverity: 'error',
        ruleName: 'enforceModuleBoundaries'
    };
    var sourceFile = ts.createSourceFile('proj/apps/myapp/src/main.ts', content, ts.ScriptTarget.Latest, true);
    var rule = new nxEnforceModuleBoundariesRule_1.Rule(options, 'proj', 'mycompany', appNames);
    return rule.apply(sourceFile);
}
