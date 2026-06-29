# Backend Module Generation Prompt

Based on the current project structure, continue implementing new modules while strictly following the existing architecture and maintaining consistent coding style across the entire project.

---

# Project Context

The project is using a layered architecture with the following structure:

- api
- components
- dtos
- lib
- repositories
- services

There is already a fully implemented reference module inside the `API` folder that should be used as the standard reference for:

- naming conventions
- folder structure
- response format
- validation patterns
- repository pattern
- service pattern
- error handling
- typing conventions
- pagination/filtering
- async handling
- transaction handling (if applicable)

Before generating any code:
1. Read and analyze the existing reference module carefully
2. Understand the architecture and coding patterns
3. Follow the same implementation style consistently

Then continue implementing the following modules:

- shelves
- store-layout
- planogram

---

# Mandatory Requirements

## 1. Preserve Existing Architecture

Do NOT change or introduce a different structure for:

- folder structure
- naming conventions
- response conventions
- DTO patterns
- repository/service separation
- import style
- coding style
- Prisma usage patterns
- validation patterns

All new code must remain fully consistent with the existing reference module.

---

# 2. Fully Implement Each Module

Each module must include complete implementation for:

## API Layer

Implement:

- create
- update
- delete
- getById
- getAll
- pagination
- filtering
- search
- sorting

Must include:

- request validation
- typed responses
- proper error handling
- proper status codes
- clean async/await handling

---

## DTOs

Create:

- Create DTO
- Update DTO
- Response DTO
- Filter DTO
- Pagination DTO

Validation must clearly support:

- required fields
- optional fields
- enums
- min/max validation
- nullable fields
- nested objects (if applicable)

---

## Repository Layer

All database logic must be separated into repositories:

- create
- update
- delete
- findFirst
- findMany
- count
- transaction handling
- relation includes
- pagination queries

Do NOT place raw Prisma logic directly inside services.

---

## Service Layer

Services must handle:

- business logic
- validation logic
- duplicate checking
- relation validation
- data transformation
- pagination mapping
- standardized error throwing

Code must remain clean and scalable.

---

# 3. Required Data Relationships

## shelves

Must support relations with:

- store-layout
- planogram (if applicable)

Must support:

- position
- rotation
- size
- metadata
- active/inactive state

---

## store-layout

Must support:

- width
- height
- background
- scaling
- multiple shelves
- layout metadata

Detail APIs must include:

- shelves
- related planograms

---

## planogram

Must support:

- product-to-shelf mapping
- product positioning
- quantity
- facings
- coordinates
- metadata

The structure should be designed to support future features such as:

- drag-and-drop UI
- realtime updates
- auto arrangement
- analytics

---

# 4. Coding Requirements

## Code Quality

The code must be:

- clean architecture
- fully typed
- no usage of `any`
- reusable
- maintainable
- query optimized
- free from duplicate logic
- scalable

---

## Prisma Requirements

Optimize:

- include/select usage
- transactions
- indexing suggestions
- relation queries
- pagination performance

---

## Error Handling

Standardize the following errors:

- NotFound
- BadRequest
- Conflict
- ValidationError

Do NOT throw raw errors directly.

---

## Pagination Response Format

Pagination responses must follow this structure:

```ts
{
  data: [],
  pagination: {
    total,
    page,
    limit,
    totalPages
  }
}