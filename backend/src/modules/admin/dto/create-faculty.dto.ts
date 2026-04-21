import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @MinLength(2)
  employeeId: string;

  @IsString()
  @MinLength(2)
  department: string;

  @IsString()
  @MinLength(1)
  section: string;
}
