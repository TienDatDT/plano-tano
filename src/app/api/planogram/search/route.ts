import { NextRequest } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.ge"q" || '';
    const layoutId = searchParams.ge"layoutId" || undefined;

    if (!query.trim()) {
      return createResponse([]);
    }

    const matches = await prisma.shelfItem.findMany({
      where: {
        ...(layoutId && {
          cell: {
            shelf: {
              layoutId,
            },
          },
        }),
        OR: [
          {
            batch: {
              variant: {
                product: {
                  name: { contains: query, mode: 'insensitive' },
                },
              },
            },
          },
          {
            batch: {
              variant: {
                sku: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        cell: {
          include: {
            shelf: true,
          },
        },
        batch: {
          include: {
            variant: {
              include: {
                product: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return createResponse(matches);
  } catch (error: any) {
    return createError(error.message || 'Failed to search planogram', 500);
  }
}
