import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BackgroundImage } from "@/generated/prisma/browser";

// Type for BackgroundImage without the binary data (as returned by API)
export type BackgroundImageMetadata = Omit<BackgroundImage, 'data'>;

// Type definitions that match the backend service schema
export interface CreateBackgroundImageInput {
  data: string; // base64 encoded string
  filename?: string;
  deviceType?: 'desktop' | 'mobile' | 'all';
  isActive?: boolean;
  displaySize?: string;
  displayPosition?: string;
  displayRepeat?: string;
  displayOpacity?: number;
  displayBlur?: number;
}

export interface UpdateBackgroundImageInput {
  data?: string; // base64 encoded string
  filename?: string;
  deviceType?: 'desktop' | 'mobile' | 'all';
  isActive?: boolean;
  displaySize?: string;
  displayPosition?: string;
  displayRepeat?: string;
  displayOpacity?: number;
  displayBlur?: number;
}

export interface SetActiveBackgroundImageInput {
  isActive: boolean;
}

// API fetch functions
async function getBackgroundImages(params?: {
  deviceType?: 'desktop' | 'mobile' | 'all';
}): Promise<BackgroundImageMetadata[]> {
  const searchParams = new URLSearchParams();
  if (params?.deviceType) {
    searchParams.append('deviceType', params.deviceType);
  }
  
  const url = `/api/wallpaper${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch background images: ${response.statusText}`);
  }
  return response.json();
}

async function getBackgroundImage(id: string): Promise<BackgroundImageMetadata> {
  const response = await fetch(`/api/wallpaper/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch background image: ${response.statusText}`);
  }
  return response.json();
}

async function getActiveBackgroundImages(params?: {
  deviceType?: 'desktop' | 'mobile' | 'all';
}): Promise<BackgroundImageMetadata[]> {
  const searchParams = new URLSearchParams({ active: 'true' });
  if (params?.deviceType) {
    searchParams.append('deviceType', params.deviceType);
  }
  
  const response = await fetch(`/api/wallpaper?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch active background images: ${response.statusText}`);
  }
  return response.json();
}

async function createBackgroundImage(data: CreateBackgroundImageInput): Promise<BackgroundImageMetadata> {
  const response = await fetch("/api/wallpaper", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to create background image: ${response.statusText}`);
  }
  return response.json();
}

async function updateBackgroundImage(
  id: string, 
  data: UpdateBackgroundImageInput
): Promise<BackgroundImageMetadata> {
  const response = await fetch("/api/wallpaper", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to update background image: ${response.statusText}`);
  }
  return response.json();
}

async function setActiveBackgroundImage(
  id: string,
  data: SetActiveBackgroundImageInput
): Promise<BackgroundImageMetadata> {
  const response = await fetch(`/api/wallpaper/${id}/active`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to set active state: ${response.statusText}`);
  }
  return response.json();
}

async function deleteBackgroundImage(id: string): Promise<{ message: string }> {
  const response = await fetch("/api/wallpaper", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete background image: ${response.statusText}`);
  }
  return response.json();
}

// React Query hooks

/**
 * Hook to fetch all background images for the current user
 * 
 * @param params - Optional filter parameters and initial data
 * @returns Query result with background images
 * 
 * @example
 * ```tsx
 * // Get all background images
 * const { data: images } = useBackgroundImagesQuery();
 * 
 * // Get only desktop wallpapers
 * const { data: desktopImages } = useBackgroundImagesQuery({ deviceType: 'desktop' });
 * 
 * // With server-side initial data
 * const { data: images } = useBackgroundImagesQuery({ initialData: serverWallpapers });
 * ```
 */
export function useBackgroundImagesQuery(params?: {
  deviceType?: 'desktop' | 'mobile' | 'all';
  initialData?: BackgroundImageMetadata[];
}) {
  return useQuery({
    queryKey: ["wallpapers", params?.deviceType || "all"],
    queryFn: () => getBackgroundImages(params),
    initialData: params?.initialData,
  });
}

/**
 * Hook to fetch a single background image by ID
 * 
 * @param id - Background image ID
 * @returns Query result with background image
 * 
 * @example
 * ```tsx
 * const { data: image } = useBackgroundImageQuery({ id: "image-id" });
 * ```
 */
export function useBackgroundImageQuery({ id }: { id: string }) {
  return useQuery({
    queryKey: ["wallpapers", id],
    queryFn: () => getBackgroundImage(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch active background images
 * 
 * @param params - Optional filter parameters
 * @returns Query result with active background images
 * 
 * @example
 * ```tsx
 * // Get active wallpaper for desktop
 * const { data: activeDesktop } = useActiveBackgroundImagesQuery({ deviceType: 'desktop' });
 * ```
 */
export function useActiveBackgroundImagesQuery(params?: {
  deviceType?: 'desktop' | 'mobile' | 'all';
}) {
  return useQuery({
    queryKey: ["wallpapers", "active", params?.deviceType || "all"],
    queryFn: () => getActiveBackgroundImages(params),
  });
}

/**
 * Hook to create a new background image (upload wallpaper)
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const { mutate: uploadWallpaper } = useCreateBackgroundImageMutation();
 * 
 * uploadWallpaper({
 *   data: base64Image,
 *   filename: 'wallpaper.jpg',
 *   deviceType: 'desktop',
 *   isActive: true,
 * });
 * ```
 */
export function useCreateBackgroundImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<BackgroundImageMetadata, Error, CreateBackgroundImageInput>({
    mutationFn: (data) => createBackgroundImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
    },
  });
}

/**
 * Hook to update a background image with optimistic updates
 * 
 * This hook provides instant UI feedback by optimistically updating the cache
 * before the server responds. If the update fails, it automatically rolls back.
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const { mutate: updateWallpaper } = useUpdateBackgroundImageMutation();
 * 
 * updateWallpaper({
 *   id: 'image-id',
 *   data: {
 *     displaySize: 'contain',
 *     displayBlur: 5,
 *   }
 * });
 * ```
 */
export function useUpdateBackgroundImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    BackgroundImageMetadata, 
    Error, 
    { id: string; data: UpdateBackgroundImageInput },
    { previousWallpapers?: BackgroundImageMetadata[] }
  >({
    mutationFn: ({ id, data }) => updateBackgroundImage(id, data),
    onMutate: async (variables) => {
      const queryKey = ["wallpapers", "all"];
      
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value for potential rollback
      const previousWallpapers = queryClient.getQueryData<BackgroundImageMetadata[]>(queryKey);
      
      // Optimistically update the cache
      if (previousWallpapers) {
        queryClient.setQueryData<BackgroundImageMetadata[]>(
          queryKey,
          previousWallpapers.map((wallpaper) =>
            wallpaper.id === variables.id
              ? { ...wallpaper, ...variables.data }
              : wallpaper
          )
        );
      }
      
      // Return context with previous data for rollback
      return { previousWallpapers };
    },
    onError: (_error, _variables, context) => {
      const queryKey = ["wallpapers", "all"];
      
      // Rollback to previous state on error
      if (context?.previousWallpapers) {
        queryClient.setQueryData(queryKey, context.previousWallpapers);
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to sync with server
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      queryClient.invalidateQueries({ queryKey: ["wallpapers", data.id] });
    },
  });
}

/**
 * Hook to set the active state of a background image
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const { mutate: setActive } = useSetActiveBackgroundImageMutation();
 * 
 * // Activate a wallpaper
 * setActive({ id: 'image-id', data: { isActive: true } });
 * 
 * // Deactivate a wallpaper
 * setActive({ id: 'image-id', data: { isActive: false } });
 * ```
 */
export function useSetActiveBackgroundImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    BackgroundImageMetadata,
    Error,
    { id: string; data: SetActiveBackgroundImageInput }
  >({
    mutationFn: ({ id, data }) => setActiveBackgroundImage(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      queryClient.invalidateQueries({ queryKey: ["wallpapers", "active"] });
    },
  });
}

/**
 * Hook to delete a background image
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const { mutate: deleteWallpaper } = useDeleteBackgroundImageMutation();
 * 
 * deleteWallpaper('image-id');
 * ```
 */
export function useDeleteBackgroundImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id) => deleteBackgroundImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
    },
  });
}

