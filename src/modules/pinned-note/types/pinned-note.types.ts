export interface PinnedNoteItem {
  id: string;
  noteId: string;
  name: string;
  price: number;
}

export interface PinnedNote {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: PinnedNoteItem[];
}

export interface CreatePinnedNoteInput {
  title: string;
  items: {
    name: string;
    price: number;
  }[];
}

export interface UpdatePinnedNoteInput {
  title?: string;
  items?: {
    id?: string;
    name: string;
    price: number;
  }[];
}
