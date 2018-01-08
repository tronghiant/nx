import { Tree } from '@angular-devkit/schematics';
export declare function updateJsonFile(path: string, callback: (a: any) => any): void;
export declare function addApp(apps: any[] | undefined, newApp: any): any[];
export declare function serializeJson(json: any): string;
export declare function cliConfig(host: Tree): any;
export declare function readCliConfigFile(): any;