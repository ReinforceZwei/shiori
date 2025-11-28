import { prisma, Prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateAndDetectImageType } from "@/lib/utils/image";
import { NotFoundError, ValidationError } from "@/lib/errors";

// Allowed image MIME types for wallpapers
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// Get all background images for a user, optionally filtered by device type
export async function getBackgroundImages({ 
  userId, 
  deviceType 
}: { 
  userId: string; 
  deviceType?: 'desktop' | 'mobile' | 'all';
}) {
  const backgroundImages = await prisma.backgroundImage.findMany({
    where: {
      userId,
      ...(deviceType ? { deviceType } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return backgroundImages;
}

// Get a single background image by ID
export async function getBackgroundImage({ 
  id, 
  userId 
}: { 
  id: string; 
  userId?: string;
}) {
  const backgroundImage = await prisma.backgroundImage.findUnique({
    where: userId ? { id, userId } : { id },
  });
  return backgroundImage;
}

// Get active background images, optionally filtered by device type
export async function getActiveBackgroundImages({ 
  userId, 
  deviceType 
}: { 
  userId: string; 
  deviceType?: 'desktop' | 'mobile' | 'all';
}) {
  const backgroundImages = await prisma.backgroundImage.findMany({
    where: {
      userId,
      isActive: true,
      ...(deviceType ? { deviceType } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return backgroundImages;
}

const createBackgroundImageInputSchema = z.object({
  userId: z.string(),
  data: z.base64(), // base64 encoded string
  filename: z.string().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'all']).default('all'),
  isActive: z.boolean().default(false),
  displaySize: z.string().default('cover'),
  displayPosition: z.string().default('center'),
  displayRepeat: z.string().default('no-repeat'),
  displayOpacity: z.number().min(0).max(1).default(1.0),
  displayBlur: z.number().min(0).default(0),
});

export async function createBackgroundImage(
  data: z.infer<typeof createBackgroundImageInputSchema>
) {
  const validatedData = createBackgroundImageInputSchema.parse(data);
  
  // Validate image and detect actual MIME type from binary data
  const detectedMimeType = await validateAndDetectImageType(
    validatedData.data,
    ALLOWED_IMAGE_TYPES
  );
  
  // Create background image
  const backgroundImage = await prisma.backgroundImage.create({
    data: {
      data: Buffer.from(validatedData.data, 'base64'),
      mimeType: detectedMimeType,
      filename: validatedData.filename,
      deviceType: validatedData.deviceType,
      isActive: validatedData.isActive,
      displaySize: validatedData.displaySize,
      displayPosition: validatedData.displayPosition,
      displayRepeat: validatedData.displayRepeat,
      displayOpacity: validatedData.displayOpacity,
      displayBlur: validatedData.displayBlur,
      user: {
        connect: { id: validatedData.userId },
      },
    },
  });
  
  return backgroundImage;
}

const updateBackgroundImageInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  data: z.base64().optional(), // base64 encoded string
  filename: z.string().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'all']).optional(),
  isActive: z.boolean().optional(),
  displaySize: z.string().optional(),
  displayPosition: z.string().optional(),
  displayRepeat: z.string().optional(),
  displayOpacity: z.number().min(0).max(1).optional(),
  displayBlur: z.number().min(0).optional(),
});

export async function updateBackgroundImage(
  data: z.infer<typeof updateBackgroundImageInputSchema>
) {
  const validatedData = updateBackgroundImageInputSchema.parse(data);
  
  // Check if background image exists and belongs to user (if userId provided)
  const backgroundImage = await prisma.backgroundImage.findUnique({
    where: validatedData.userId 
      ? { id: validatedData.id, userId: validatedData.userId }
      : { id: validatedData.id },
  });
  
  if (!backgroundImage) {
    throw new NotFoundError(`BackgroundImage(id: ${validatedData.id}) not found`);
  }
  
  // Build update data object with only fields to update
  const updateData: Prisma.BackgroundImageUpdateInput = {};
  
  // Handle image data update if provided
  if (validatedData.data !== undefined) {
    const detectedMimeType = await validateAndDetectImageType(
      validatedData.data,
      ALLOWED_IMAGE_TYPES
    );
    updateData.data = Buffer.from(validatedData.data, 'base64');
    updateData.mimeType = detectedMimeType;
  }
  
  if (validatedData.filename !== undefined) {
    updateData.filename = validatedData.filename;
  }
  if (validatedData.deviceType !== undefined) {
    updateData.deviceType = validatedData.deviceType;
  }
  if (validatedData.isActive !== undefined) {
    updateData.isActive = validatedData.isActive;
  }
  if (validatedData.displaySize !== undefined) {
    updateData.displaySize = validatedData.displaySize;
  }
  if (validatedData.displayPosition !== undefined) {
    updateData.displayPosition = validatedData.displayPosition;
  }
  if (validatedData.displayRepeat !== undefined) {
    updateData.displayRepeat = validatedData.displayRepeat;
  }
  if (validatedData.displayOpacity !== undefined) {
    updateData.displayOpacity = validatedData.displayOpacity;
  }
  if (validatedData.displayBlur !== undefined) {
    updateData.displayBlur = validatedData.displayBlur;
  }
  
  // Update background image if there are changes
  if (Object.keys(updateData).length === 0) {
    return backgroundImage;
  }
  
  const updatedBackgroundImage = await prisma.backgroundImage.update({
    where: { id: validatedData.id },
    data: updateData,
  });
  
  return updatedBackgroundImage;
}

const setActiveBackgroundImageInputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  isActive: z.boolean(),
});

/**
 * Sets the active state of a background image
 * This is a helper function to explicitly manage active/inactive state
 */
export async function setActiveBackgroundImage(
  data: z.infer<typeof setActiveBackgroundImageInputSchema>
) {
  const validatedData = setActiveBackgroundImageInputSchema.parse(data);
  
  // Check if background image exists and belongs to user
  const backgroundImage = await prisma.backgroundImage.findUnique({
    where: { id: validatedData.id, userId: validatedData.userId },
  });
  
  if (!backgroundImage) {
    throw new NotFoundError(`BackgroundImage(id: ${validatedData.id}) not found`);
  }
  
  // Update active state
  const updatedBackgroundImage = await prisma.backgroundImage.update({
    where: { id: validatedData.id },
    data: { isActive: validatedData.isActive },
  });
  
  return updatedBackgroundImage;
}

const deleteBackgroundImageInputSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
});

export async function deleteBackgroundImage(
  data: z.infer<typeof deleteBackgroundImageInputSchema>
) {
  const validatedData = deleteBackgroundImageInputSchema.parse(data);
  
  // Check if background image exists and belongs to user (if userId provided)
  const backgroundImage = await prisma.backgroundImage.findUnique({
    where: validatedData.userId 
      ? { id: validatedData.id, userId: validatedData.userId }
      : { id: validatedData.id },
  });
  
  if (!backgroundImage) {
    throw new NotFoundError(`BackgroundImage(id: ${validatedData.id}) not found`);
  }
  
  // Delete the background image
  await prisma.backgroundImage.delete({
    where: { id: validatedData.id },
  });
}

