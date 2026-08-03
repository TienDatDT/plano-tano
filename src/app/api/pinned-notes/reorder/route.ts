import { NextRequest } from 'next/server';
import { pinnedNoteService } from '@/modules/pinned-note/services/pinned-note.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Expecting body.items to be an array of { id: string, order: number }
    if (!body.items || !Array.isArray(body.items)) {
      throw new Error('Invalid payload: items array is required');
    }

    const data = await pinnedNoteService.reorderPinnedNotes(body.items);
    return createResponse(data);
  } catch (error: any) {
    return createError(error);
  }
}
