import { IsIn, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string;

  @IsString()
  @IsIn(['student', 'admin', 'faculty'])
  role: string;

  @IsString()
  @MinLength(6)
  password: string;
}
