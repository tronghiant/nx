export declare type Project = {
    name: string;
    isApp: boolean;
    files: string[];
};
export declare function affectedApps(npmScope: string, projects: Project[], fileRead: (s: string) => string, touchedFiles: string[]): string[];
export declare function dependencies(npmScope: string, projects: Project[], fileRead: (s: string) => string): {
    [appName: string]: string[];
};
