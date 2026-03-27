import { Module, forwardRef} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [AuthController], // Controller cho các endpoint liên quan đến xác thực
  providers: [AuthGuard, AuthService], // Khai báo người gác cổng và service ở đây
  exports: [JwtModule, AuthGuard, AuthService], // Xuất cả hai để module khác (như Post) có thể dùng chung
})
export class AuthModule {}