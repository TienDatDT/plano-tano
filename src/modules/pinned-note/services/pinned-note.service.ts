import { prisma } from '@/shared/lib/prisma';
import type { CreatePinnedNoteInput, UpdatePinnedNoteInput } from '../types/pinned-note.types';

export class PinnedNoteService {
  async getPinnedNotes() {
    const notes = await prisma.pinnedNote.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert decimal to number for API serialization if needed, 
    // but Next.js App Router usually handles this or we can map it.
    return notes.map(note => ({
      ...note,
      items: note.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    }));
  }

  async getPinnedNoteById(id: string) {
    const note = await prisma.pinnedNote.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!note) {
      throw new Error('Pinned note not found');
    }

    return {
      ...note,
      items: note.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }

  async createPinnedNote(data: CreatePinnedNoteInput) {
    const note = await prisma.pinnedNote.create({
      data: {
        title: data.title,
        items: {
          create: data.items.map(item => ({
            name: item.name,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      ...note,
      items: note.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }

  async updatePinnedNote(id: string, data: UpdatePinnedNoteInput) {
    // We update title, and for items we delete old and insert new for simplicity,
    // or handle upsert. To keep it simple, if data.items is provided, we replace all items.
    
    if (data.items) {
      await prisma.pinnedNoteItem.deleteMany({
        where: { noteId: id },
      });
    }

    const note = await prisma.pinnedNote.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.items ? {
          items: {
            create: data.items.map(item => ({
              name: item.name,
              price: item.price,
            })),
          }
        } : {}),
      },
      include: {
        items: true,
      },
    });

    return {
      ...note,
      items: note.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    };
  }

  async deletePinnedNote(id: string) {
    await prisma.pinnedNote.delete({
      where: { id },
    });
    return { success: true };
  }
}

export const pinnedNoteService = new PinnedNoteService();
