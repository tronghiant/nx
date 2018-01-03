import * as Lint from 'tslint';
import { IOptions } from 'tslint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    private path;
    private npmScope;
    private appNames;
    constructor(options: IOptions, path?: string, npmScope?: string, appNames?: string[]);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
    private readCliConfig();
}
