import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @MinLength(2)
  @Matches(/^\d{3}[A-Z]{2}[A-Z0-9]{5}$/, {
    message: 'Registration number must follow the format (e.g., 231FA04023 or 231FA04A01)',
  })
  studentId: string;

  @IsString()
  @MinLength(2)
  department: string;

  @IsString()
  @MinLength(2)
  program: string;

  @IsOptional()
  @IsString()
  admissionCategory?: string;

  @IsNumber()
  @Type(() => Number)
  year: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semester?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  graduationYear?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  counsellorId?: string;
}
