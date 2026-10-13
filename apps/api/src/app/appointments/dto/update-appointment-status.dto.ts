import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../common/enums';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus, { message: 'Trạng thái không hợp lệ' })
  @IsNotEmpty({ message: 'status không được để trống' })
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  note?: string; // Ghi chú lý do hủy hoặc kết quả phục vụ
}
