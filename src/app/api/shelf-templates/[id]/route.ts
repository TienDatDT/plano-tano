// app/api/shelf-templates/[id]/route.ts

import { shelfTemplateService } from '@/modules/shelves/services/shelf-template.service';

import {
  createError,
  createResponse,
} from '@/shared/lib/api-response';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// ─────────────────────────────────────────────
// GET /api/shelf-templates/[id]
// ─────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const result =
      await shelfTemplateService.findById(id);

    return createResponse(result);
  } catch (error: any) {
    return createError(
      error.message || 'Failed to fetch shelf template',
      500
    );
  }
}

// ─────────────────────────────────────────────
// PUT /api/shelf-templates/[id]
// ─────────────────────────────────────────────

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const result =
      await shelfTemplateService.update(
        id,
        body
      );

    return createResponse(result);
  } catch (error: any) {
    return createError(
      error.message || 'Failed to update shelf template',
      500
    );
  }
}

// ─────────────────────────────────────────────
// DELETE /api/shelf-templates/[id]
// ─────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await shelfTemplateService.delete(id);

    return createResponse({
      success: true,
    });
  } catch (error: any) {
    return createError(
      error.message || 'Failed to delete shelf template',
      500
    );
  }
}