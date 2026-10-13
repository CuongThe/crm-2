import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNumberString({}, { message: 'customerId phải là định dạng ID hợp lệ' })
  @IsNotEmpty({ message: 'customerId không được để trống' })
  customerId: string;

  @IsNumberString({}, { message: 'staffId phải là định dạng ID hợp lệ' })
  @IsNotEmpty({ message: 'staffId không được để trống' })
  staffId: string;

  @IsNumberString({}, { message: 'serviceId phải là định dạng ID hợp lệ' })
  @IsNotEmpty({ message: 'serviceId không được để trống' })
  serviceId: string;

  @IsDateString(
    {},
    {
      message:
        'startTime phải theo chuẩn ISO 8601 (ví dụ: 2026-10-08T09:00:00Z)',
    },
  )
  @IsNotEmpty({ message: 'startTime không được để trống' })
  startTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
