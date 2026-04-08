import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_ENTITIES } from './entities';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const sslEnabled = configService.get('DB_SSL', 'true') === 'true';
            const rejectUnauthorized =
              configService.get('DB_SSL_REJECT_UNAUTHORIZED', 'false') === 'true';

            return {
              type: 'postgres',
              url: configService.getOrThrow<string>('DATABASE_URL'),
              ssl: sslEnabled ? { rejectUnauthorized } : false,
              autoLoadEntities: true,
              synchronize: false,
              logging: configService.get('DB_LOGGING', 'false') === 'true',
              entities: [...DATABASE_ENTITIES],
            };
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
