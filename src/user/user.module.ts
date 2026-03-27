import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [PrismaService, UserService], 
})
export class UserModule {}
