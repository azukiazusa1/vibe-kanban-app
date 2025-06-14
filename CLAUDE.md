# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a modern Kanban board application built with Next.js 15 using the App Router architecture. The stack consists of:

- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM 
- **UI Components**: shadcn/ui with "new-york" style variant
- **Drag & Drop**: @dnd-kit/sortable for kanban functionality
- **Icons**: Lucide React

### Database Schema
The Prisma schema defines a hierarchical structure:
- `Board` (root entity with title/description)
- `Column` (belongs to Board, has position and color)
- `Task` (belongs to Column, has priority, due date, completion status)

Tasks have a Priority enum (LOW, MEDIUM, HIGH, URGENT) and support positioning within columns.

### Project Structure
- `app/` - Next.js App Router pages and layouts
- `lib/` - Shared utilities (currently contains Tailwind class merger)
- `prisma/` - Database schema and migrations
- `components.json` - shadcn/ui configuration with path aliases

## Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open database browser

# Start PostgreSQL via Docker
docker-compose up -d

# Reset database
docker-compose down -v && docker-compose up -d
```

## Key Configuration

- **Database**: Expects `DATABASE_URL` environment variable pointing to PostgreSQL
- **Paths**: Uses `@/*` alias mapping to project root
- **Tailwind**: Configured for CSS variables with neutral base color
- **TypeScript**: Strict mode enabled with Next.js plugin