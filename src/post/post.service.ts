import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
@Injectable()
export class PostService {


  constructor(private prisma: PrismaService) {}


  async create(postData: any) {
    // Dùng lệnh create bạn vừa nói để lưu vào Database
    const newPost = await this.prisma.post.create({
      data: {
        image: postData.image,
        caption: postData.caption,
        userId: postData.userId,
      },
    });

    return {
      message: 'Đăng bài thành công!',
      data: newPost
    };
  }

  async findAll() {
  // 1. Lấy dữ liệu từ Database
  const posts = await this.prisma.post.findMany({
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return posts.map((item) => {
    return {
      ...item,
      image: `http://localhost:3001/uploads/${item.image}`, 
      user: {
        ...item.user,
        avatar: item.user.avatar 
          ? `http://localhost:3001/uploads/${item.user.avatar}` 
          : null
      }
    };
  });
}

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          }
        }
      }
    });
    if (!post) {
      return { message: 'Bài viết không tồn tại!' };
    }
    post.image = `http://localhost:3001/uploads/${post.image}`;
    post.user.avatar = post.user.avatar
      ? `http://localhost:3001/uploads/${post.user.avatar}`
      : null;
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return { message: 'Bài viết không tồn tại!' };
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: number , userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id }
    });
    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại!');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này!');
    }
    try {
      if (post.image) {
        await fs.promises.unlink(`./uploads/${post.image}`);
      }
    } catch (error) {
      console.error('Error occurred while deleting image file:', error);
    }
    await this.prisma.post.delete({
      where: { id },
    });
    return { message: 'Xóa bài viết thành công!' };
  }
}
