import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards, Request, BadRequestException, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @UseGuards(AuthGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, cb) => {
        const ext = extname(file.originalname); 
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); 
        cb(null, `avatar-${uniqueSuffix}${ext}`); 
      }
    })
  }))

  async updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    // 1. Lấy ID người dùng từ Token (đã được AuthGuard giải mã)
    const userId = Number(req.user.sub);
    
    // 2. Lấy tên file vừa được lưu
    const fileName = file.filename;

    // 3. Gọi Service để cập nhật vào Database
    return this.userService.updateAvatar(userId, fileName);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('profile-test')
  async getProfile(@Request() req) {
    const userId = Number(req.user?.sub); 
    return this.userService.getProfile(userId);
  } 
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }   
}
 