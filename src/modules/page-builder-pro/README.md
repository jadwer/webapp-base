# Page Builder Pro Module

Complete visual page building solution using GrapeJS for creating and managing dynamic web pages.

## Features

- **Visual Editor**: Drag-and-drop page builder with GrapeJS
- **CRUD Operations**: Create, Read, Update, Delete, and Duplicate pages
- **Real-time Validation**: Slug generation and availability checking
- **Page Management**: Status control (draft/published), search, filtering, pagination
- **Bootstrap Integration**: Pre-built component library with Bootstrap classes
- **Navigation Progress**: Seamless UX with progress indicators

## Architecture

### Core Components

- **`PagesAdminTemplate`** - Main administration interface
- **`PageEditorTemplate`** - Visual page editor with loading states
- **`PageForm`** - Page metadata form with validation
- **`PagesTable`** - Data table with advanced features
- **`StatusBadge`** - Visual status indicators

### Services

- **`pagesService.ts`** - API integration for CRUD operations
- **`fetchPage.ts`** - Public page fetching for rendering

### Types

- **`page.ts`** - TypeScript definitions for page data structures

## Usage

### Administration Interface

Navigate to `/dashboard/pages` to:
- View all pages in a sortable, filterable table
- Create new pages
- Edit existing pages
- Duplicate pages
- Delete pages
- Search and filter by status

### Page Editor

Navigate to `/dashboard/page-builder/{id}` to:
- Use the visual drag-and-drop editor
- Edit page title and slug
- Set page status
- Preview changes
- Auto-save progress

### Public Pages

Published pages are automatically available at `/p/{slug}`

## Technical Implementation

### Editor Initialization

The page editor uses a robust initialization system that:
- Prevents double initialization in React StrictMode
- Handles race conditions and cleanup
- Shows loading states during initialization
- Provides comprehensive error handling

### Content Rendering

Public pages use a hydration-safe rendering system that:
- Extracts content from GrapeJS format
- Injects CSS inline for proper styling
- Maintains Bootstrap compatibility
- Prevents server/client mismatch errors

### Data Management

- Uses SWR for efficient caching and real-time updates
- Implements optimistic updates for better UX
- Handles API errors gracefully
- Supports pagination and filtering

## API Integration

Works with the `api-base` backend module, expecting JSON:API format responses with:

```typescript
interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  html: string
  css?: string
  json?: object
  createdAt: string
  updatedAt: string
}
```

## Development Notes

### Adding Custom Blocks

Custom GrapeJS blocks can be added by extending the plugins in:
- `plugins/grapesjs-blocks-ui-bootstrap.ts`
- `plugins/grapejs-organize-default-blocks.ts`

### Styling

The module uses Bootstrap 5.3.3 loaded globally in the app layout. Custom styles are injected per-page basis.

### Memory Management

The editor properly cleans up resources when unmounting to prevent memory leaks and race conditions.