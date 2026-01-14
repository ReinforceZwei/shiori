"use server";

import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Create a new API key
 */
export async function createApiKeyAction(data: {
  name: string;
  expiresInSeconds?: number;
}) {
  await requireUser();
  
  try {
    const result = await auth.api.createApiKey({
      headers: await headers(),
      body: {
        name: data.name,
        expiresIn: data.expiresInSeconds,
      },
    });
    
    revalidatePath('/settings/api-key');
    
    // Return the full key (only shown once)
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create API key',
    };
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKeyAction(keyId: string) {
  await requireUser();
  
  try {
    await auth.api.deleteApiKey({
      headers: await headers(),
      body: {
        keyId: keyId,
      },
    });
    
    revalidatePath('/settings/api-key');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete API key',
    };
  }
}