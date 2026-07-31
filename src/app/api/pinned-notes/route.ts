import { NextRequest, NextResponse } from 'next/server';
import { pinnedNoteService } from '@/modules/pinned-note/services/pinned-note.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const data = await pinnedNoteService.getPinnedNotes();
    return createResponse(data);
  } catch (error:any) {
    return createError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await pinnedNoteService.createPinnedNote(body);
    return createResponse(data, 201);
  } catch (error:any) {
    return createError(error);
  }
}
