# Money Manager

A comprehensive personal finance tracking application with a unified transaction form for managing different transaction types.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fmoney-manager)

## Features

- Account management (debit cards, credit cards, bank accounts)
- Unified transaction form for all transaction types
- Transaction tracking and categorization
- Credit/loan management
- Recurring payment tracking

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS with shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL in Docker with Prisma ORM
- **State Management**: Zustand for local state, TanStack Query for server state
- **Development Environment**: Docker Compose for PostgreSQL database

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- Docker and Docker Compose
- npm or pnpm

### Setup Database

1. Start the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```

3. Initialize Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

### Run the Application

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
money-2/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   └── ...               # Page components
├── components/           # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── docs/                 # Project documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared code
│   ├── stores/           # Zustand stores
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## Development

### Database Management

- **View database**: `npx prisma studio`
- **Create migration**: `npx prisma migrate dev --name <migration-name>`
- **Reset database**: `npx prisma migrate reset`

### Docker Commands

- **Start database**: `docker-compose up -d`
- **Stop database**: `docker-compose down`
- **View logs**: `docker-compose logs postgres`

## Documentation

- Design documentation is available in the `/docs` directory
- API documentation will be added as endpoints are implemented

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request
