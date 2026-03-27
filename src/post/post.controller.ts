import { Controller, Get, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, Post, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { extname } from 'path/win32';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { AuthGuard } from 'src/auth/guards/auth.guard';
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `post-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any                         
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên một bức ảnh!');
    }
    const postData = {
      image: file.filename,
      caption: body.caption,
      userId: Number(body.userId), 
    };
    return this.postService.create(postData);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.postService.remove(+id, req.user.id);
  }
}
