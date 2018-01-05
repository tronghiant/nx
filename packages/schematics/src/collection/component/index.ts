import { apply, branchAndMerge, chain, pathTemplate, SchematicContext,  mergeWith,  move,  noop,  Rule,  template,  Tree,  url} from '@angular-devkit/schematics';

import generator from '@schematics/angular/component';
import * as stringUtils from '@schematics/angular/strings';
import * as fs from 'fs';
import * as path from 'path';


var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};


export default function (options: any): Rule {
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

  
  const rule1 = generator(options);

  const rule2 = template({
      'ts': (s: string) => 'ts'
  });

  const rule3 = (host: Tree, context: SchematicContext) => {

    console.log(host.exists('apps/frmd/src/app/test/test.component.ts'))
    console.log(JSON.stringify(options, null, 2));

    return host;
  };


  const finalRule = (host: Tree, context: SchematicContext) => {
    return chain([
      branchAndMerge(
        chain([
          rule1,
          // rule2,
          rule3,
        ]
        )),
    ])(host, context);
  }
  
  return finalRule;
}