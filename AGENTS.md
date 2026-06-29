<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.


## Project Architecture

- Framework: Next.js (App Router)
- Structure:

src/
  app/            # Routing (Next.js App Router)
  modules/        # Business logic (domain-based)
    category/
      services/
      repositories/
      types/
  shared/
    lib/          # common utils (api-response, fetcher)
    components/   # reusable UI
## API Rules

- Always use `createResponse` for success
- Always use `createError` for error handling
- Do NOT return raw JSON

Example:
return createResponse(data)
return createError(error)
## Service Layer Rules

- All business logic MUST be inside `services`
- API route must NOT contain business logic
- API only calls service

Bad:
GET -> query database directly ❌

Good:
GET -> categoryService.getCategories() ✅
## Database Rules

- Use Prisma ORM
- Do NOT write raw SQL unless necessary
- Keep relation consistent (bidirectional)

- Naming:
  - Model: PascalCase
  - field: camelCase
  
## Frontend Data Fetching

- Use fetch or custom fetcher from `shared/lib`
- Do NOT call database directly from UI
- Prefer Server Component for data fetching when possible

## Naming Convention

- file: kebab-case
- function: camelCase
- class/service: PascalCase

Example:
category.service.ts
getCategories()
CategoryService## Anti-patterns

- Do NOT duplicate logic between services
- Do NOT put business logic inside API route
- Do NOT mix UI and business logic
- Do NOT create new folder structure without following `modules/`

## Error Handling

- Always wrap API in try/catch
- Use `createError`
- Do NOT expose raw error stack to client

## Example API Route

import { categoryService } from '@/modules/category/services/category.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET() {
  try {
    const data = await categoryService.getCategories();
    return createResponse(data);
  } catch (error) {
    return createError(error);
  }
}
<!-- END:nextjs-agent-rules -->
