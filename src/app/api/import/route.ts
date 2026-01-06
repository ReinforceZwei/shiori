import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@/lib/with-auth';
import { BulkService } from '@/features/bulk/service';
import { JobService, startWorker } from '@/features/job';
import { z } from 'zod';

// Input schema matching bulkImportBookmarksAction
const importRequestSchema = z.object({
  collections: z.array(z.object({
    mode: z.enum(['create', 'existing', 'uncollected']),
    newName: z.string().optional(),
    existingId: z.string().optional(),
    bookmarks: z.array(z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
      websiteIcon: z.object({
        data: z.string(),
        mimeType: z.string(),
      }).optional(),
    })),
  })),
  fetchMetadata: z.boolean().optional().default(false),
});

/**
 * POST /api/import
 * 
 * Bulk import bookmarks with collections
 * 
 * Features:
 * - Import bookmarks without inline metadata enrichment
 * - If fetchMetadata is true, create background jobs to fetch metadata
 * - Returns 200 for normal import, 201 for import with metadata jobs created
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    const data = importRequestSchema.parse(body);
    
    // Import bookmarks without enriched metadata and get created bookmark IDs
    const bulkService = new BulkService();
    const createdBookmarks = await bulkService.importBookmarksWithCollections({
      userId: user.id,
      collections: data.collections,
    });
    
    // Revalidate the main layout to update all bookmark and collection UI
    revalidatePath('/(main)', 'layout');
    
    // If fetchMetadata is true, create jobs for metadata fetching
    if (data.fetchMetadata) {
      
      // Create jobs using the returned bookmark IDs
      const jobService = new JobService();
      const jobs = createdBookmarks
        .map((bookmark) => {
          return {
            userId: user.id,
            type: 'fetch-bookmark-metadata',
            payload: {
              url: bookmark.url,
              bookmarkId: bookmark.id,
              userId: user.id,
            },
            maxRetries: 0, // Handler already retries internally
          };
        })
        .filter((job): job is NonNullable<typeof job> => job !== null);
      
      if (jobs.length > 0) {
        await jobService.enqueueBatch({ jobs });
        startWorker();
      }
      
      return NextResponse.json(
        { 
          success: true,
          message: 'Bookmarks imported and metadata fetch jobs created',
          count: jobs.length,
        },
        { status: 201 }
      );
    }
    
    // Normal import without metadata fetching
    return NextResponse.json(
      { 
        success: true,
        message: 'Bookmarks imported successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in bulk import:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import bookmarks',
      },
      { status: 500 }
    );
  }
});

