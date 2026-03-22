import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';  
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    PrismaModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule], // 👈 Import ConfigModule vào đây
      inject: [ConfigService], // 👈 Tiêm ConfigService vào để dùng
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // 👈 Lấy key từ file .env
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [PrismaService, UserService, JwtModule], // Nếu bạn muốn dùng UserService ở module khác thì phải export nó ra đây
})
export class UserModule {}
