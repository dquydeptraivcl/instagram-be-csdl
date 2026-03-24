import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards, Request, BadRequestException, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './auth.guard';
import { request } from 'http';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }
  @UseGuards(AuthGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('Thông tin file nhận được:', file);
      return { message: 'Đã nhận file!' };
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
 