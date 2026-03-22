import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config'; // 1. Thêm import này
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 3. Khởi tạo bộ kết nối tiêu chuẩn
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any); // 2. Tạo adapter với pool kết nối

    // 4. Truyền adapter vào Prisma
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}