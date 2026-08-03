export interface PinnedNoteItem {
  id: string;
  noteId: string;
  name: string;
  price: number;
}

export interface PinnedNote {
  id: string;
  title: string;
  tab: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  items: PinnedNoteItem[];
}

export interface CreatePinnedNoteInput {
  title: string;
  tab?: string;
  order?: number;
  items: {
    name: string;
    price: number;
  }[];
}

export interface UpdatePinnedNoteInput {
  title?: string;
  tab?: string;
  order?: number;
  items?: {
    id?: string;
    name: string;
    price: number;
  }[];
}
