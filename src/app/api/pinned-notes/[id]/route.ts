import { NextRequest, NextResponse } from 'next/server';
import { pinnedNoteService } from '@/modules/pinned-note/services/pinned-note.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await pinnedNoteService.getPinnedNoteById(id);
    return createResponse(data);
  } catch (error:any) {
    return createError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await pinnedNoteService.updatePinnedNote(id, body);
    return createResponse(data);
  } catch (error:any) {
    return createError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pinnedNoteService.deletePinnedNote(id);
    return createResponse({ success: true });
  } catch (error:any) {
    return createError(error);
  }
}
