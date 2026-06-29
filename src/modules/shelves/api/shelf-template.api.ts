// src/modules/shelf-template/apis/shelf-template.api.ts

import {
  CreateShelfTemplateDTO,
  UpdateShelfTemplateDTO,
  ShelfTemplateFilterDTO,
  ShelfTemplate,
} from '../dtos/shelf-template.dto';

const BASE = '/api/shelf-templates';


class ShelfTemplateApi {
  // ─────────────────────────────────────────────
  // GET MANY
  // ─────────────────────────────────────────────

  async getMany(
    params?: ShelfTemplateFilterDTO
  ) {
    const query = new URLSearchParams();

    if (params?.search) {
      query.set("search", params.search);
    }

    if (params?.layoutType) {
      query.set(
        'layoutType',
        params.layoutType
      );
    }

    if (params?.page) {
      query.set(
        'page',
        String(params.page)
      );
    }

    if (params?.limit) {
      query.set(
        'limit',
        String(params.limit)
      );
    }

    if (params?.sortBy) {
      query.set(
        'sortBy',
        params.sortBy
      );
    }

    if (params?.sortOrder) {
      query.set(
        'sortOrder',
        params.sortOrder
      );
    }

    const res = await fetch(
      `${BASE}?${query.toString()}`,
      {
        method: 'GET',
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to fetch shelf templates'
      );
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // GET ALL
  // ─────────────────────────────────────────────

  async getAll() {
    const res = await fetch(
      BASE,
      {
        method: 'GET',
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to fetch shelf templates'
      );
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // GET DETAIL
  // ─────────────────────────────────────────────

  async getById(id: string) {
    const res = await fetch(
      `${BASE}/${id}`,
      {
        method: 'GET',
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to fetch shelf template'
      );
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────

  async create(
    payload: CreateShelfTemplateDTO
  ) {
    const res = await fetch(BASE, {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(
        'Failed to create shelf template'
      );
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────

  async update(
    id: string,
    payload: UpdateShelfTemplateDTO
  ) {
    const res = await fetch(
      `${BASE}/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to update shelf template'
      );
    }

    return res.json();
  }

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────

  async delete(id: string) {
    const res = await fetch(
      `${BASE}/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!res.ok) {
      throw new Error(
        'Failed to delete shelf template'
      );
    }

    return res.json();
  }
}

export const shelfTemplateApi =
  new ShelfTemplateApi();