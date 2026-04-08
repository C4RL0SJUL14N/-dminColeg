import { INestApplication } from '@nestjs/common';
export interface BootstrapOptions {
    appName: string;
    appDescription: string;
    version?: string;
    globalPrefix?: string;
}
export declare function configureApplication(app: INestApplication, options: BootstrapOptions): void;
