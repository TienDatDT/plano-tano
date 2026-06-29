import { NextRequest } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.ge"q" || '';

    if (!query.trim()) {
      return createResponse([]);
    }

    const matches = await prisma.productVariant.findMany({
      where: {
        OR: [
          {
            product: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
          {
            sku: { contains: query, mode: 'insensitive' },
          },
        ],
      },
      include: {
        product: true,
        unit: true,
        batches: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return createResponse(matches);
  } catch (error: any) {
    return createError(error.message || 'Failed to search products', 500);
  }
}
