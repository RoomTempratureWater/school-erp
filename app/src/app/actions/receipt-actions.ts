'use server';

import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getGeneralReceipts(filters?: { search?: string, startDate?: string, endDate?: string }) {
  try {
    const where: any = {};
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { receivedFromName: { contains: filters.search, mode: 'insensitive' } },
        { receiptNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const receipts = await prisma.generalReceipt.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: receipts };
  } catch (error: any) {
    console.error('Error fetching general receipts:', error);
    return { success: false, error: error.message };
  }
}

export async function getGeneralReceiptById(id: number) {
  try {
    const receipt = await prisma.generalReceipt.findUnique({
      where: { id },
    });
    if (!receipt) {
      return { success: false, error: 'Receipt not found' };
    }
    return { success: true, data: receipt };
  } catch (error: any) {
    console.error('Error fetching general receipt:', error);
    return { success: false, error: error.message };
  }
}

export async function createGeneralReceipt(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const receivedFromName = formData.get('receivedFromName') as string;
    const receivedFromPhone = formData.get('receivedFromPhone') as string || null;
    const receivedFromPan = formData.get('receivedFromPan') as string || null;
    const paymentMethod = formData.get('paymentMethod') as PaymentMethod;
    const paymentReference = formData.get('paymentReference') as string || null;

    if (!title || !amount || !receivedFromName || !paymentMethod) {
      return { success: false, error: 'Missing required fields' };
    }

    const newReceipt = await prisma.$transaction(async (tx) => {
      // Create with a temporary receipt number
      const tempNumber = `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const created = await tx.generalReceipt.create({
        data: {
          title,
          amount,
          receivedFromName,
          receivedFromPhone,
          receivedFromPan,
          paymentMethod,
          paymentReference: paymentMethod === 'CASH' ? null : paymentReference,
          receiptNumber: tempNumber,
        },
      });

      // Update to the final format G-{ID}
      return await tx.generalReceipt.update({
        where: { id: created.id },
        data: { receiptNumber: `G-${created.id}` },
      });
    });

    revalidatePath('/general-receipts');
    return { success: true, data: newReceipt };
  } catch (error: any) {
    console.error('Error creating general receipt:', error);
    return { success: false, error: error.message };
  }
}
