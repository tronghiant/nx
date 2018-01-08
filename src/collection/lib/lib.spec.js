"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
var stripJsonComments = require("strip-json-comments");
describe('lib', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
        schematicRunner.logger.subscribe(function (s) { return console.log(s); });
    });
    describe('not nested', function () {
        it('should update angular-cli.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
            expect(updatedAngularCLIJson.apps).toEqual([
                {
                    appRoot: '',
                    name: 'my-lib',
                    root: 'libs/my-lib/src',
                    test: '../../../test.js'
                }
            ]);
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', nomodule: true }, appTree);
            expect(tree.exists('libs/my-lib/src/my-lib.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/src/my-lib.spec.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/index.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'libs/my-lib/src/my-lib.ts')).toContain('class MyLib');
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            expect(tree.exists('libs/my-lib/src/my-lib.module.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/src/my-lib.module.spec.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/index.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'libs/my-lib/src/my-lib.module.ts')).toContain('class MyLibModule');
        });
    });
    describe('nested', function () {
        it('should update angular-cli.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir' }, appTree);
            var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
            expect(updatedAngularCLIJson.apps).toEqual([
                {
                    appRoot: '',
                    name: 'my-dir/my-lib',
                    root: 'libs/my-dir/my-lib/src',
                    test: '../../../../test.js'
                }
            ]);
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', nomodule: true }, appTree);
            expect(tree.exists('libs/my-dir/my-lib/src/my-lib.ts')).toBeTruthy();
            expect(tree.exists('libs/my-dir/my-lib/src/my-lib.spec.ts')).toBeTruthy();
            expect(tree.exists('libs/my-dir/my-lib/index.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/my-lib.ts')).toContain('class MyLib');
        });
    });
    describe('router', function () {
        it('should error when routing is set with nomodule = true', function () {
            expect(function () {
                return schematicRunner.runSchematic('lib', { name: 'myLib', nomodule: true, routing: true }, appTree);
            }).toThrow('nomodule and routing cannot be used together');
        });
        it('should error when lazy is set without routing', function () {
            expect(function () { return schematicRunner.runSchematic('lib', { name: 'myLib', lazy: true }, appTree); }).toThrow('routing must be set');
        });
        describe('lazy', function () {
            it('should add RouterModule.forChild', function () {
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true, lazy: true }, appTree);
                expect(tree.exists('libs/my-dir/my-lib/src/my-lib.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/my-lib.module.ts')).toContain('RouterModule.forChild');
            });
            it('should update the parent module', function () {
                appTree = testing_utils_1.createApp(appTree, 'myapp');
                var tree = schematicRunner.runSchematic('lib', {
                    name: 'myLib',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, appTree);
                expect(test_1.getFileContent(tree, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-lib', loadChildren: '@proj/my-dir/my-lib#MyLibModule'}])");
                var tsConfigAppJson = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/myapp/src/tsconfig.app.json')));
                expect(tsConfigAppJson.include).toEqual(['**/*.ts', '../../../libs/my-dir/my-lib/index.ts']);
                var tree2 = schematicRunner.runSchematic('lib', {
                    name: 'myLib2',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, tree);
                expect(test_1.getFileContent(tree2, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-lib', loadChildren: '@proj/my-dir/my-lib#MyLibModule'}, {path: 'my-lib2', loadChildren: '@proj/my-dir/my-lib2#MyLib2Module'}])");
                var tsConfigAppJson2 = JSON.parse(stripJsonComments(test_1.getFileContent(tree2, 'apps/myapp/src/tsconfig.app.json')));
                expect(tsConfigAppJson2.include).toEqual([
                    '**/*.ts',
                    '../../../libs/my-dir/my-lib/index.ts',
                    '../../../libs/my-dir/my-lib2/index.ts'
                ]);
                var tsConfigE2EJson = JSON.parse(stripJsonComments(test_1.getFileContent(tree2, 'apps/myapp/e2e/tsconfig.e2e.json')));
                expect(tsConfigE2EJson.include).toEqual([
                    '../**/*.ts',
                    '../../../libs/my-dir/my-lib/index.ts',
                    '../../../libs/my-dir/my-lib2/index.ts'
                ]);
            });
            it('should register the module as lazy loaded in tslint.json', function () {
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true, lazy: true }, appTree);
                var tslint = JSON.parse(test_1.getFileContent(tree, 'tslint.json'));
                expect(tslint['rules']['nx-enforce-module-boundaries'][1]['lazyLoad']).toEqual(['my-dir/my-lib']);
            });
        });
        describe('eager', function () {
            it('should add RouterModule and define an array of routes', function () {
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true }, appTree);
                expect(tree.exists('libs/my-dir/my-lib/src/my-lib.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/my-lib.module.ts')).toContain('RouterModule]');
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/my-lib.module.ts')).toContain('const myLibRoutes: Route[] = ');
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/index.ts')).toContain('myLibRoutes');
            });
            it('should update the parent module', function () {
                appTree = testing_utils_1.createApp(appTree, 'myapp');
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true, parentModule: 'apps/myapp/src/app/app.module.ts' }, appTree);
                expect(test_1.getFileContent(tree, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-lib', children: myLibRoutes}])");
                var tree2 = schematicRunner.runSchematic('lib', { name: 'myLib2', directory: 'myDir', routing: true, parentModule: 'apps/myapp/src/app/app.module.ts' }, tree);
                expect(test_1.getFileContent(tree2, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-lib', children: myLibRoutes}, {path: 'my-lib2', children: myLib2Routes}])");
            });
        });
    });
});