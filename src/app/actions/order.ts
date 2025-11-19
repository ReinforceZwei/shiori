'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { upsertOrder } from '@/features/order/service';

const bookmarkOrderSchema = z.object({
  collectionId: z.string().optional().nullable(),
  order: z.array(z.string()),
});

export async function saveBookmarkOrderAction(input: z.infer<typeof bookmarkOrderSchema>) {
  try {
    const user = await requireUser();
    const data = bookmarkOrderSchema.parse(input);

    await upsertOrder({
      userId: user.id,
      type: 'bookmark',
      collectionId: data.collectionId ?? null,
      order: data.order,
    });

    revalidatePath('/(main)', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error in saveBookmarkOrderAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save bookmark order',
    };
  }
}

const collectionOrderSchema = z.object({
  order: z.array(z.string()),
});

export async function saveCollectionOrderAction(input: z.infer<typeof collectionOrderSchema>) {
  try {
    const user = await requireUser();
    const data = collectionOrderSchema.parse(input);

    await upsertOrder({
      userId: user.id,
      type: 'collection',
      collectionId: null,
      order: data.order,
    });

    revalidatePath('/(main)', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error in saveCollectionOrderAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save collection order',
    };
  }
}


