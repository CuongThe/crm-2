'use server';

import { revalidatePath } from 'next/cache';
import { createCustomer, updateCustomer, deleteCustomer } from '@crm-2/data-access';

export async function createCustomerAction(formData: {
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  notes?: string;
}) {
  try {
    const newCustomer = await createCustomer({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || undefined,
      gender: formData.gender,
      dob: formData.dob || undefined,
      notes: formData.notes?.trim() || undefined,
    });

    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true, data: newCustomer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo khách hàng' };
  }
}

export async function updateCustomerAction(
  id: string,
  formData: {
    fullName: string;
    phone: string;
    email?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dob?: string;
    notes?: string;
  },
) {
  try {
    const updated = await updateCustomer(id, {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() || undefined,
      gender: formData.gender,
      dob: formData.dob || undefined,
      notes: formData.notes?.trim() || undefined,
    });

    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật khách hàng' };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await deleteCustomer(id);
    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa khách hàng' };
  }
}
