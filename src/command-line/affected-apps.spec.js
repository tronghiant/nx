"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var affected_apps_1 = require("./affected-apps");
describe('Calculates Dependencies Between Apps and Libs', function () {
    describe('dependencies', function () {
        it('should return a graph with a key for every project', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1',
                    files: [],
                    isApp: true
                },
                {
                    name: 'app2',
                    files: [],
                    isApp: true
                }
            ], function () { return null; });
            expect(deps).toEqual({ app1: ['app1'], app2: ['app2'] });
        });
        it('should infer deps between projects based on imports', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1',
                    files: ['app1.ts'],
                    isApp: true
                },
                {
                    name: 'lib1',
                    files: ['lib1.ts'],
                    isApp: false
                },
                {
                    name: 'lib2',
                    files: ['lib2.ts'],
                    isApp: false
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            import '@nrwl/lib1';\n            import '@nrwl/lib2/deep';\n          ";
                    case 'lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'lib2.ts':
                        return '';
                }
            });
            expect(deps).toEqual({ app1: ['app1', 'lib1', 'lib2'], lib1: ['lib1', 'lib2'], lib2: ['lib2'] });
        });
        it('should infer transitive deps between projects', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1',
                    files: ['app1.ts'],
                    isApp: true
                },
                {
                    name: 'lib1',
                    files: ['lib1.ts'],
                    isApp: false
                },
                {
                    name: 'lib2',
                    files: ['lib2.ts'],
                    isApp: false
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'lib2.ts':
                        return '';
                }
            });
            expect(deps).toEqual({ app1: ['app1', 'lib1', 'lib2'], lib1: ['lib1', 'lib2'], lib2: ['lib2'] });
        });
        it('should infer dependencies expressed via loadChildren', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1',
                    files: ['app1.ts'],
                    isApp: true
                },
                {
                    name: 'lib1',
                    files: ['lib1.ts'],
                    isApp: false
                },
                {
                    name: 'lib2',
                    files: ['lib2.ts'],
                    isApp: false
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            const routes = {\n              path: 'a', loadChildren: '@nrwl/lib1#LibModule',\n              path: 'b', loadChildren: '@nrwl/lib2/deep#LibModule'\n            };\n          ";
                    case 'lib1.ts':
                        return '';
                    case 'lib2.ts':
                        return '';
                }
            });
            expect(deps).toEqual({ app1: ['app1', 'lib1', 'lib2'], lib1: ['lib1'], lib2: ['lib2'] });
        });
        it('should handle non-ts files', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1',
                    files: ['index.html'],
                    isApp: true
                }
            ], function () { return null; });
            expect(deps).toEqual({ app1: ['app1'] });
        });
    });
    describe('affectedApps', function () {
        it('should return the list of affected files', function () {
            var affected = affected_apps_1.affectedApps('nrwl', [
                {
                    name: 'app1',
                    files: ['app1.ts'],
                    isApp: true
                },
                {
                    name: 'app2',
                    files: ['app2.ts'],
                    isApp: true
                },
                {
                    name: 'lib1',
                    files: ['lib1.ts'],
                    isApp: false
                },
                {
                    name: 'lib2',
                    files: ['lib2.ts'],
                    isApp: false
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'app2.ts':
                        return "";
                    case 'lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'lib2.ts':
                        return '';
                }
            }, ['lib2.ts']);
            expect(affected).toEqual(['app1']);
        });
        it('should return app app names if a touched file is not part of a project', function () {
            var affected = affected_apps_1.affectedApps('nrwl', [
                {
                    name: 'app1',
                    files: ['app1.ts'],
                    isApp: true
                },
                {
                    name: 'app2',
                    files: ['app2.ts'],
                    isApp: true
                },
                {
                    name: 'lib1',
                    files: ['lib1.ts'],
                    isApp: false
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'app2.ts':
                        return "";
                    case 'lib1.ts':
                        return "import '@nrwl/lib2'";
                }
            }, ['package.json']);
            expect(affected).toEqual(['app1', 'app2']);
        });
        it('should handle slashes', function () {
            var affected = affected_apps_1.affectedApps('nrwl', [
                {
                    name: 'app1',
                    files: ['one\\app1.ts', 'two/app1.ts'],
                    isApp: true
                }
            ], function (file) {
                switch (file) {
                    case 'one/app1.ts':
                        return '';
                    case 'two/app1.ts':
                        return '';
                }
            }, ['one/app1.ts', 'two/app1.ts']);
            expect(affected).toEqual(['app1']);
        });
    });
});
