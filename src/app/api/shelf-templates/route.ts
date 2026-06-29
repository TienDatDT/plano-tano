import { shelfTemplateService } from '@/modules/shelves/services/shelf-template.service';

import {
  createError,
  createResponse,
} from '@/shared/lib/api-response';

export async function GET() {
  try {
    const result =
      await shelfTemplateService.findAll();

    return createResponse(result);
  } catch (error: any) {
    console.error(error);

    return createError(
      error.message ||
      'Failed to fetch shelf templates',
      500
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result =
      await shelfTemplateService.create(body);

    return createResponse(result);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}