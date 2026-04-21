import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class RegisterStudentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  @Matches(/^\d{3}[A-Z]{2}\d{5}$/, {
    message: 'Registration number must follow the format 231FA04023',
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
  @Min(1)
  @Max(6)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(2)
  semester: number;

  @IsNumber()
  @Min(2024)
  @Max(2100)
  graduationYear: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  section?: string;
}
