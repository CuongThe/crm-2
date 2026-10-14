import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from '../../common/enums';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ tên khách hàng không được để trống' })
  fullName!: string;

  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại phải từ 10-11 chữ số' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính phải là MALE, FEMALE hoặc OTHER' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  dob?: string; // Định dạng YYYY-MM-DD

  @IsOptional()
  @IsString()
  notes?: string;
}
