# Money Manager

A comprehensive personal finance tracking application built with Next.js, PostgreSQL, and Drizzle ORM.

## Features

- Account management (debit and credit accounts)
- Transaction tracking with categories
- Transfer money between accounts
- Credit management (track money lent or borrowed)
- Recurring payment tracking
- Financial insights and reporting

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Development**: Docker, TypeScript
- **UI Components**: Custom components with Tailwind CSS

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm (recommended) or npm

### Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-manager.git
   cd money-manager
   ```

2. Start the Docker containers:
   ```bash
   docker compose up -d
   ```

3. Run database migrations:
   ```bash
   docker compose exec app pnpm db:push
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

### Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

- **Run migrations**: `pnpm db:push`
- **Generate migrations**: `pnpm db:generate`
- **Open database studio**: `pnpm db:studio`

## Project Structure

```
money-manager/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   └── page.tsx          # Main page
├── components/           # React components
├── db/                   # Database models and configuration
├── docs/                 # Project documentation
├── lib/                  # Utility functions
├── migrations/           # Database migrations
├── public/               # Static assets
├── docker-compose.yml    # Docker configuration
└── README.md             # This file
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository.

2. Connect your GitHub repository to Vercel:
   - Sign up or log in to [Vercel](https://vercel.com)
   - Click "New Project" and import your GitHub repository
   - Configure the project settings

3. Set up environment variables:
   - Add your `DATABASE_URL` in the Vercel project settings
   - Consider using [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) for easy database integration

4. Deploy your project:
   - Vercel will automatically build and deploy your application
   - Your app will be available at a Vercel-generated URL

## API Documentation

See [API Documentation](./docs/api_documentation.md) for details on available endpoints.

## Project Roadmap

See [Project Roadmap](./docs/project_roadmap.md) for the development plan.

## Next Steps

See [Next Steps](./docs/next_steps.md) for immediate development priorities.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
