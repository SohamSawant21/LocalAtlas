# LocalAtlas - Discover the Unseen

LocalAtlas is a premium, community-driven platform for discovering, sharing, and reviewing hidden gems along the Konkan coast. Transitioning away from mainstream tourist hotspots, LocalAtlas surfaces unmapped waterfalls, pristine secret coves, historical ruins, and local eateries that are typically known only to locals.

![LocalAtlas Cover](public/cover-placeholder.png)

## 🚀 Features

### For Explorers
- **Interactive Map**: A highly responsive exploration map showing hidden gems based on districts (Sindhudurg, Ratnagiri, Raigad) and categories (Beaches, Forts, Trails, Waterfalls).
- **Explorer Passport**: A gamified reputation system tracking your discoveries, saves, and contributions. Level up your Explorer Badge by submitting verified gems.
- **Trip Planner**: Seamlessly combine multiple discoveries into custom itineraries.

### For Contributors
- **Community Verified**: A trust-based upvote/downvote system with strict moderation to ensure only high-quality destinations are mapped.
- **Stories**: Publish rich markdown blogs and travelogues with high-res images to share your journey with the community.
- **Robust Security**: Full-stack NextAuth protection. Only authenticated users can contribute. Role-Based Access Control (RBAC) ensures safe moderation.

## 🏗️ Architecture

This project is built using modern, production-ready web technologies:
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth v5)
- **Storage**: AWS S3 (Presigned URLs)
- **Validation**: Zod + React Hook Form
- **State Management**: Zustand
- **Animations**: Framer Motion

### 📂 Folder Structure

```
src/
├── actions/      # Next.js Server Actions (Mutations & Business Logic)
├── app/          # App Router Pages & API Routes
├── components/   # Reusable UI Components
│   ├── shared/   # Global components (Navbar, Footer, GemCard)
│   ├── ui/       # shadcn/ui primitives
│   └── ...       # Feature-specific components
├── lib/          # Utilities (Prisma Client, utils, logger)
├── services/     # Data Access Layer (DB Queries & Caching)
└── types/        # TypeScript Definitions
```

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/localatlas.git
   cd localatlas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/localatlas"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

We use Vitest for unit testing and Playwright for End-to-End testing.

- **Run Unit Tests:** `npm test`
- **Run E2E Tests:** `npm run test:e2e`
- **Run Linters:** `npm run lint` && `npx tsc --noEmit`

## 🛡️ Security

LocalAtlas implements multiple layers of security:
- **CSRF Protection**: Native to NextAuth.js.
- **Rate Limiting**: Enforced on server actions and API routes.
- **Upload Security**: Direct-to-S3 presigned URLs with strict `< 5MB` file limits and MIME-type validation. Binary blobs never touch the Node backend.
- **RBAC**: `/admin` moderation tools require `ADMIN` or `MODERATOR` session roles.
- **Input Validation**: `zod` schema parsing strictly sanitizes data on the client and server prior to DB execution.

## 📈 Performance Optimizations

- **Next.js `unstable_cache`**: Core database retrievals (e.g., getting the top locations) are cached persistently with Time-Based Revalidation (ISR) bypassing repeated Postgres lookups.
- **Optimistic UI**: Real-time perception using `useOptimistic` for Actions like saving a gem or upvoting a post.
- **Dynamic Imports**: Heavy components like Interactive Maps are lazy-loaded via `next/dynamic`.

## 🤝 Contribution Guidelines

We welcome community contributions. Please ensure all pull requests pass CI/CD pipeline checks (linting, type checking, and unit testing) before requesting a review. Create a new branch off `main` and use conventional commits.

## 📄 License

This project is licensed under the MIT License.
