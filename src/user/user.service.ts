import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
@Injectable()
  export class UserService {

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        password: hashedPassword, // Thay thế mật khẩu gốc bằng bản mã hóa
        // avatar: createUserDto.avatar, (nếu bạn có dùng avatar thì bật lên)
      },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
        // Chúng ta sẽ kiểm tra mã lỗi ở đây
        if (error.code === 'P2002') {
        // Ném ra một lỗi xung đột (Conflict)
          throw new ConflictException('Email hoặc Username đã tồn tại');
        }
        throw error; // Nếu là lỗi khác thì cứ để nó báo lỗi bình thường
      }
    }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID người dùng không hợp lệ hoặc bị thiếu!');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: id }, // Prisma bị lỗi ở đây vì id đang là undefined
    });

    if (!user) {
      throw new NotFoundException(`User với id ${id} không tồn tại`);
    } 
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy User với id ${id} để cập nhật`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Không tìm thấy User với id ${id} để xóa`);
      }
    }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });
    if (!user) {  
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const payload = { 
      sub: user.id, 
      username: user.username 
    }; 
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }


  async getProfile(userId: number) {
    const user = await this.findOne(userId);
    
    const { password, ...result } = user;
  return result;
  }

  async updateAvatar(userId: number, avatarFileName: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: avatarFileName, // Cập nhật tên file vào cột avatar
      },
      select: {
        id: true,
        username: true,
        avatar: true, // Trả về thông tin cơ bản kèm ảnh mới để kiểm tra
      }
    });
  }


}
