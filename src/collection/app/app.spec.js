"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../testing-utils");
var test_1 = require("@schematics/angular/utility/test");
var stripJsonComments = require("strip-json-comments");
describe('app', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    describe('not nested', function () {
        it('should update angular-cli.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl' }, appTree);
            var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
            expect(updatedAngularCLIJson.apps).toEqual([
                {
                    assets: ['assets', 'favicon.ico'],
                    environmentSource: 'environments/environment.ts',
                    environments: { dev: 'environments/environment.ts', prod: 'environments/environment.prod.ts' },
                    index: 'index.html',
                    main: 'main.ts',
                    name: 'my-app',
                    outDir: 'dist/apps/my-app',
                    polyfills: 'polyfills.ts',
                    prefix: 'app',
                    root: 'apps/my-app/src',
                    scripts: [],
                    styles: ['styles.css'],
                    test: '../../../test.js',
                    testTsconfig: '../../../tsconfig.spec.json',
                    tsconfig: 'tsconfig.app.json'
                }
            ]);
            expect(updatedAngularCLIJson.lint).toEqual([
                {
                    project: "apps/my-app/src/tsconfig.app.json",
                    exclude: '**/node_modules/**'
                },
                {
                    project: "apps/my-app/e2e/tsconfig.e2e.json",
                    exclude: '**/node_modules/**'
                }
            ]);
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl' }, appTree);
            expect(tree.exists('apps/my-app/src/main.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/src/app/app.module.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/src/app/app.component.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/e2e/app.po.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'apps/my-app/src/app/app.module.ts')).toContain('class AppModule');
            var tsconfigApp = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-app/src/tsconfig.app.json')));
            expect(tsconfigApp.compilerOptions.outDir).toEqual('../../../dist/out-tsc/apps/my-app');
            var tsconfigE2E = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-app/e2e/tsconfig.e2e.json')));
            expect(tsconfigE2E.compilerOptions.outDir).toEqual('../../../dist/out-tsc/e2e/my-app');
        });
    });
    describe('nested', function () {
        it('should update angular-cli.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir' }, appTree);
            var updatedAngularCLIJson = JSON.parse(test_1.getFileContent(tree, '/.angular-cli.json'));
            expect(updatedAngularCLIJson.apps).toEqual([
                {
                    assets: ['assets', 'favicon.ico'],
                    environmentSource: 'environments/environment.ts',
                    environments: { dev: 'environments/environment.ts', prod: 'environments/environment.prod.ts' },
                    index: 'index.html',
                    main: 'main.ts',
                    name: 'my-dir/my-app',
                    outDir: 'dist/apps/my-dir/my-app',
                    polyfills: 'polyfills.ts',
                    prefix: 'app',
                    root: 'apps/my-dir/my-app/src',
                    scripts: [],
                    styles: ['styles.css'],
                    test: '../../../../test.js',
                    testTsconfig: '../../../../tsconfig.spec.json',
                    tsconfig: 'tsconfig.app.json'
                }
            ]);
            expect(updatedAngularCLIJson.lint).toEqual([
                {
                    project: "apps/my-dir/my-app/src/tsconfig.app.json",
                    exclude: '**/node_modules/**'
                },
                {
                    project: "apps/my-dir/my-app/e2e/tsconfig.e2e.json",
                    exclude: '**/node_modules/**'
                }
            ]);
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir' }, appTree);
            expect(tree.exists('apps/my-dir/my-app/src/main.ts')).toBeTruthy();
            expect(tree.exists('apps/my-dir/my-app/src/app/app.module.ts')).toBeTruthy();
            expect(tree.exists('apps/my-dir/my-app/src/app/app.component.ts')).toBeTruthy();
            expect(tree.exists('apps/my-dir/my-app/e2e/app.po.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.module.ts')).toContain('class AppModule');
            var tsconfigApp = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/tsconfig.app.json')));
            expect(tsconfigApp.compilerOptions.outDir).toEqual('../../../../dist/out-tsc/apps/my-dir/my-app');
            var tsconfigE2E = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-dir/my-app/e2e/tsconfig.e2e.json')));
            expect(tsconfigE2E.compilerOptions.outDir).toEqual('../../../../dist/out-tsc/e2e/my-dir/my-app');
        });
    });
    it('should import NgModule', function () {
        var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir' }, appTree);
        expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.module.ts')).toContain('NxModule.forRoot()');
    });
    describe('routing', function () {
        it('should include RouterTestingModule', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir', routing: true }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.module.ts')).toContain('RouterModule.forRoot');
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.spec.ts')).toContain('imports: [RouterTestingModule]');
        });
    });
    describe('view encapsulation', function () {
        it('should not set Component encapsulation metadata if option flag not included', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir' }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.ts')).not.toContain('encapsulation: ');
        });
        it('should set Component encapsulation metadata if option flag is included', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', npmScope: 'nrwl', directory: 'myDir', viewEncapsulation: 'Native' }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.ts')).toContain('encapsulation: ViewEncapsulation.Native');
        });
    });
});
