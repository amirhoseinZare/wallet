import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/config/env.enum';
import { User } from 'src/user/user.entity';
import { Transaction } from 'src/transaction/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>(EnvVariables.DB_HOST),
          port: +configService.get<number>(EnvVariables.DB_PORT),
          username: configService.get<string>(EnvVariables.DB_USER),
          password: configService.get<string>(EnvVariables.DB_PASSWORD),
          database: configService.get<string>(EnvVariables.DB_NAME),
          autoLoadEntities: true,
          synchronize: true, // MUST Set to false in production
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Transaction]),
  ],
})
export class DatabaseModule {}
