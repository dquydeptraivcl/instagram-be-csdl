// src/auth/auth.service.ts
import { forwardRef,   Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService, // Nhờ UserService tìm người dùng
    private jwtService: JwtService,   // Nhờ JwtService ký thẻ bài
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // 1. Tìm user theo email (Hàm findByEmail bạn đã thêm ở UserService)
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // 2. So sánh mật khẩu đã băm
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // 3. Cấp thẻ bài (Token)
    const payload = { id: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}