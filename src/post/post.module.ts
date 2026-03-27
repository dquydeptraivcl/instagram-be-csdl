import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module'; // Import module an ninh

@Module({
  imports: [
    PrismaModule, 
    AuthModule // Kết nối với trạm an ninh để dùng Guard và JwtService
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService], // Xuất PostService để có thể sử dụng trong các module khác nếu cần
})
export class PostModule {}