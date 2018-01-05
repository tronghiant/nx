import { Rule } from '@angular-devkit/schematics';

import generator from '@schematics/angular/component';

export default function (options: any): Rule {
  return generator(options);
}
