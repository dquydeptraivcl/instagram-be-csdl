import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
  @IsString({ message: 'Password phải là một chuỗi' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;
}