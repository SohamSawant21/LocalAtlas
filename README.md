<div align="center">
  <h1>🗺️ LocalAtlas</h1>
  <p><strong>Discover the Unseen Konkan Coast</strong></p>
  <p>A premium, community-driven platform for mapping, sharing, and exploring hidden gems.</p>
</div>

---

## 📖 Project Overview

LocalAtlas is a state-of-the-art web application designed to transition tourists away from mainstream hotspots by surfacing unmapped waterfalls, pristine secret coves, historical ruins, and authentic local eateries in the Konkan region (Sindhudurg, Ratnagiri, Raigad). 

Built with the latest technologies, LocalAtlas acts as a highly curated crowdsourced atlas where local guides and explorers can document locations, write travelogues, and earn reputation through community verification.

## ✨ Key Features

- **Interactive Maps**: A highly responsive, Leaflet-powered exploration map with clustering and geospatial calculations (via Turf.js). Filter gems by district and category (Beaches, Forts, Trails, Waterfalls, etc.).
- **Gamified Progression**: An Explorer Passport system tracking discoveries, saves, and contributions. Users earn reputation points, badges, and achievements based on community upvotes.
- **Community Verification Engine**: Locations undergo a strict moderation lifecycle (`DRAFT`, `PENDING`, `APPROVED`, `REJECTED`) and crowd-sourced verification to ensure data integrity and safety.
- **Rich Travel Stories & Reviews**: Users can publish markdown-based travelogues with high-res images and leave detailed reviews and ratings for locations.
- **Trip Planner**: Seamlessly curate custom itineraries by combining multiple discovered locations into shareable trips.
- **Social Ecosystem**: Follow your favorite local guides, engage with community posts, leave comments, and receive comprehensive notifications (likes, approvals, weather alerts, achievements).
- **Role-Based Access Control (RBAC)**: Secure moderation dashboards available only to users with `ADMIN` or `MODERATOR` roles.

## 🛠 Tech Stack

**Frontend**
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) & React 19
- **Styling**: Tailwind CSS v4, shadcn/ui, Base UI, Radix UI
- **Animations**: Framer Motion, Tailwind Animate
- **State Management**: Zustand (Client State), React Query (Server State Cache)
- **Forms & Validation**: React Hook Form, Zod
- **Mapping**: Leaflet, React-Leaflet

**Backend & Data**
- **Architecture**: Next.js Server Actions
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma (`@prisma/client` v5)
- **Authentication**: Auth.js (NextAuth v5 Beta)
- **Caching & Rate Limiting**: Upstash Redis
- **Storage**: AWS S3 (Client-side uploads via Presigned URLs)

**Testing & Tooling**
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Logging**: Pino

## 🏗 Project Architecture

LocalAtlas follows a modern Serverless-first architecture optimized for performance and security:
- **Server Actions for Mutations**: All database writes are handled securely via Next.js Server Actions (`src/actions`), ensuring strong typing from client to server.
- **Data Access Layer**: Read queries are encapsulated in the `src/services` layer with robust caching mechanisms (`unstable_cache`) to minimize PostgreSQL hits.
- **Optimistic UI**: Client components utilize `useOptimistic` for instant feedback on interactions like saving a location or liking a post.
- **Direct-to-S3 Uploads**: To bypass server payload limits, the backend generates AWS S3 Presigned URLs, allowing the client to upload heavy image blobs directly to the bucket.

## 📂 Folder Structure

```text
src/
├── actions/      # Next.js Server Actions (Data Mutations)
├── app/          # App Router Pages, Layouts, and API Routes
│   ├── (auth)/   # Authentication pages (Login, Register)
│   ├── admin/    # RBAC-protected Admin Dashboard
│   ├── api/      # NextAuth and Webhook endpoints
│   ├── explore/  # Interactive Map and Listing views
│   └── ...       # Other feature routes
├── components/   # Reusable UI Components (shadcn, forms, cards)
├── constants/    # Enums, config objects, and static data
├── lib/          # Utilities (Prisma Client, S3 clients, utils)
├── providers/    # Global React Context Providers (Theme, QueryClient)
├── services/     # Data Access Layer (DB Read Queries)
├── store/        # Zustand Stores (Client state)
└── types/        # TypeScript Definitions
```

## ⚙️ Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/localatlas.git
   cd localatlas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Spin up the Database:**
   Ensure Docker is running, then start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```

4. **Initialize Prisma:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   *(Optional) Seed the database with sample data:*
   ```bash
   npm run prisma:seed # If configured in package.json, or npx tsx prisma/seed.ts
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔐 Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/localatlas?schema=public"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication (NextAuth / Auth.js)
AUTH_SECRET="generate-a-strong-secret-key-here"
AUTH_URL="http://localhost:3000/api/auth"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_ID="your-apple-id"
APPLE_SECRET="your-apple-secret"

# Maps 
NEXT_PUBLIC_MAP_STYLE_URL="your-map-style-url"

# Storage (AWS S3)
STORAGE_URL="your-storage-url"
STORAGE_KEY="your-storage-key"
```

## 🗄️ Database and Storage

- **Database**: Structured using Prisma, featuring highly relational models. Key entities include `User`, `Location`, `Review`, `Trip`, `Story`, `CommunityPost`, and gamification entities like `Badge` and `Achievement`.
- **Storage**: User avatars and location imagery are stored in an S3-compatible blob storage. The application ensures strict `< 5MB` file limits and MIME-type validation during the upload handshake.

## 🔌 API Overview

Instead of traditional REST APIs, LocalAtlas utilizes:
1. **Next.js Server Actions**: Found in `src/actions/`, these functions handle form submissions, upvotes, and data mutations securely on the server.
2. **Standard API Routes**: `src/app/api/auth/[...nextauth]` for NextAuth.js handling and other utility endpoints like `src/app/api/avatar/` for dynamic avatar generation.

## 🛡️ Authentication and Authorization

- **Auth.js (NextAuth v5)**: Manages secure, HTTP-only cookie sessions. Supports credentials (hashed via bcryptjs) and OAuth (Google, Apple).
- **Role-Based Access Control**:
  - `USER`: Standard permissions (explore, save, submit draft locations).
  - `MODERATOR`: Can approve/reject pending locations and moderate comments.
  - `ADMIN`: Full access to the platform and user management.

## 🚀 Usage Instructions

1. **Sign Up**: Create an account to become a LocalAtlas Guide.
2. **Explore**: Navigate to the `/explore` or `/map` routes to find nearby hidden gems based on your preferred category.
3. **Contribute**: Visit `/contribute` to map a new location. Ensure you provide accurate geospatial coordinates, road conditions, and difficulty levels.
4. **Plan Trips**: Go to `/trips` to stitch saved locations into a weekend itinerary.

## 🧪 Testing

The codebase is fortified with Vitest for unit logic and Playwright for End-to-End browser interactions.
- **Run Unit Tests:** `npm run test`
- **Watch Unit Tests:** `npm run test:watch`
- **Run E2E Tests:** `npm run test:e2e`

## 🔮 Future Improvements

- **AI Recommendations**: Suggesting personalized itineraries based on saved places and user preferences.
- **Offline Mode**: Allowing users to cache maps and location data as a PWA for areas with poor cellular network (common in remote Konkan spots).
- **Expanded Coverage**: Rolling out to additional districts beyond the current Maharashtra coastline limits.

## 👥 Contributors
- **LocalAtlas Team** - Initial Implementation

## 📄 License
This project is licensed under the MIT License.
