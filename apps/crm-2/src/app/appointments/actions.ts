'use server';

import { revalidatePath } from 'next/cache';
import { createAppointment, updateAppointmentStatus, deleteAppointment } from '@crm-2/data-access';

export async function createAppointmentAction(data: {
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}) {
  try {
    const newAppointment = await createAppointment(data);
    revalidatePath('/appointments');
    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true, data: newAppointment };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo lịch hẹn' };
  }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: string,
  note?: string,
) {
  try {
    const updated = await updateAppointmentStatus(id, status, note);
    revalidatePath('/appointments');
    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật trạng thái' };
  }
}

export async function deleteAppointmentAction(id: string) {
  try {
    await deleteAppointment(id);
    revalidatePath('/appointments');
    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa lịch hẹn' };
  }
}
