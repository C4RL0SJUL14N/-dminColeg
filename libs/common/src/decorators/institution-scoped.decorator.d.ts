export interface InstitutionScopeOptions {
    param?: string;
    body?: string;
    query?: string;
}
export declare const InstitutionScoped: (options: InstitutionScopeOptions) => import("@nestjs/common").CustomDecorator<string>;
