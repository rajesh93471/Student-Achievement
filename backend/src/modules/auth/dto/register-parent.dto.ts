import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class RegisterParentDto {
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
    message: "Registration number must follow the format 231FA04023",
  })
  studentId: string;

  @IsString()
  @MinLength(2)
  relation: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
