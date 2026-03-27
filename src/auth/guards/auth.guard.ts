import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy thông tin request từ khách hàng
    const request = context.switchToHttp().getRequest<Request>();
    
    // 2. Lấy chuỗi token từ Header Authorization
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy thẻ thông hành!');
    }
    try {
        // Dùng verifyAsync cho đồng bộ với signAsync lúc login
        const payload = await this.jwtService.verifyAsync(token, { 
            secret: this.configService.get<string>('JWT_SECRET')
        }); 
        request['user'] = payload; 
        return true;
    } catch (error) {
        throw new UnauthorizedException('Token không hợp lệ!');
    }
    
    return true; // Cho qua!
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    const array = authHeader?.split(' ');
    if (array?.length === 2 && array[0] === 'Bearer') {
      return array[1];
    }
  }
}