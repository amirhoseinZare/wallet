import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        // console.log(configService.get<string>('DATABASE_HOST'));
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: +configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          autoLoadEntities: true,
          synchronize: true, // Set to false in production
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule { }
