# Drizzle to Firestore Migration Plan

## Completed Tasks
- Created Firestore configuration and utility files
- Updated user authentication to use Firebase Auth
- Updated UserAccountNav and UserAvatar components
- Updated SignInButton component to use Firebase
- Updated database index file to export Firestore instead of Drizzle
- Created migration script for transferring data
- Updated billing page to use Firestore
- Created Firebase-specific dashboard and todos pages
- Updated core API routes:
  - `/api/game/route.ts` - Updated to create and retrieve games using Firestore
  - `/api/checkAnswer/route.ts` - Updated to check answers using Firestore
  - `/api/endGame/route.ts` - Updated to end games using Firestore
  - `/api/stripe/checkout-session/route.ts` - Updated to manage subscriptions using Firestore
  - `/api/stripe/create-portal/route.ts` - Updated to retrieve user data from Firestore
- Updated game components:
  - `components/OpenEnded.tsx` - Updated to use Firestore types
  - `components/MCQ.tsx` - Updated to use Firestore types
  - `/play/mcq/[gameId]/page.tsx` - Updated to fetch game data from Firestore
  - `/play/open-ended/[gameId]/page.tsx` - Updated to fetch game data from Firestore
- Updated dashboard and statistics components:
  - `components/dashboard/HotTopicsCard.tsx` - Updated to fetch topics from Firestore
  - `components/HistoryComponent.tsx` - Updated to fetch game history from Firestore
  - `components/statistics/QuestionsList.tsx` - Updated to use Firestore types
  - `/statistics/[gameId]/page.tsx` - Updated to fetch statistics from Firestore
  - `/(user)/dashboard/QuizzesTable.tsx` - Updated to use Firestore types
- Updated quiz generation and display:
  - `/app/quizz/[quizzId]/page.tsx` - Updated to fetch quiz data from Firestore
  - `/app/quizz/QuizzQuestions.tsx` - Updated to use Firestore types
  - `/api/quizz/generate/saveToDb.tsx` - Updated to save quizzes to Firestore
  - Updated Firestore configuration to include quiz-related collections and fields

## Remaining Components to Update

### API Routes
1. ~~`/api/checkAnswer/route.ts` - Uses Drizzle to verify answers~~ ✅
2. ~~`/api/endGame/route.ts` - Uses Drizzle to update game status~~ ✅
3. ~~`/api/game/route.ts` - Uses Drizzle to create games and questions~~ ✅
4. ~~`/api/stripe/checkout-session/route.ts` - Uses Drizzle to update user subscription~~ ✅
5. ~~`/api/stripe/create-portal/route.ts` - Uses Drizzle to get user subscription~~ ✅
6. ~~`/api/quizz/generate/saveToDb.tsx` - Uses Drizzle to save quizzes~~ ✅

### Components
1. ~~`components/OpenEnded.tsx` - Uses Drizzle schema types~~ ✅
2. ~~`components/MCQ.tsx` - Uses Drizzle schema types~~ ✅
3. ~~`components/statistics/QuestionsList.tsx` - Uses Drizzle schema types~~ ✅
4. ~~`components/dashboard/HotTopicsCard.tsx` - Imports from Drizzle db~~ ✅
5. ~~`components/HistoryComponent.tsx` - Imports from Drizzle db~~ ✅

### Pages
1. ~~`/play/mcq/[gameId]/page.tsx` - Uses Drizzle to fetch game data~~ ✅
2. ~~`/play/open-ended/[gameId]/page.tsx` - Uses Drizzle to fetch game data~~ ✅
3. ~~`/statistics/[gameId]/page.tsx` - Uses Drizzle to fetch statistics~~ ✅
4. ~~`/quizz/[quizzId]/page.tsx` - Uses Drizzle to fetch quiz data~~ ✅
5. ~~`/(user)/dashboard/QuizzesTable.tsx` - Uses Drizzle schema types~~ ✅

## Migration Strategy

### Phase 1: Core API Routes ✅
1. ~~Update `/api/game/route.ts` first as it's the foundation for creating games~~ ✅
2. ~~Update `/api/checkAnswer/route.ts` and `/api/endGame/route.ts` next as they handle game interactions~~ ✅
3. ~~Update Stripe-related API routes to ensure subscription management works~~ ✅

### Phase 2: Game Components ✅
1. ~~Update `OpenEnded.tsx` and `MCQ.tsx` components to use Firestore types and queries~~ ✅
2. ~~Update game pages (`/play/mcq/[gameId]/page.tsx` and `/play/open-ended/[gameId]/page.tsx`)~~ ✅

### Phase 3: Dashboard and Statistics ✅
1. ~~Update dashboard components (`HotTopicsCard.tsx`, `QuizzesTable.tsx`)~~ ✅
2. ~~Update statistics components (`QuestionsList.tsx`, `/statistics/[gameId]/page.tsx`)~~ ✅
3. ~~Update history component (`HistoryComponent.tsx`)~~ ✅

### Phase 4: Quiz Generation ✅
1. ~~Update quiz generation and saving (`/api/quizz/generate/saveToDb.tsx`)~~ ✅
2. ~~Update quiz display page (`/quizz/[quizzId]/page.tsx`)~~ ✅

## Testing Strategy
1. Test each component after updating to ensure it works with Firestore
2. Run end-to-end tests for critical flows:
   - User authentication
   - Game creation and play
   - Subscription management
   - Statistics viewing

## Rollback Plan
If issues arise during migration:
1. Restore original `db/index.ts` file
2. Revert components to use Drizzle
3. Test to ensure functionality is restored

## Timeline
- Phase 1: 1-2 days ✅
- Phase 2: 1-2 days ✅
- Phase 3: 1-2 days ✅
- Phase 4: 1 day ✅
- Testing: 1-2 days

Total estimated time: 5-9 days 