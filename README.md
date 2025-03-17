# Aquizi - AI-Powered Quiz Platform

Aquizi is an intelligent quiz platform that uses AI to generate personalized quizzes on any topic. Challenge yourself, track your progress, and improve your knowledge with our interactive quizzes.

![Aquizi Dashboard](https://github.com/judygab/ai-form-builder-tutorial/assets/50160672/443a69ed-e441-412a-a84e-ea820022c6dc)

## Features

- **AI-Generated Quizzes**: Create custom quizzes on any topic using AI
- **Multiple Quiz Types**: Choose between multiple-choice and open-ended questions
- **Interactive Dashboard**: Track your progress with detailed statistics and visualizations
- **Performance Metrics**: View your scores, accuracy, and improvement over time
- **Activity Heatmap**: GitHub-style contribution tracking for your quiz activity
- **Retest Functionality**: Retry quizzes to improve your scores
- **Smart Vocabulary Learning**: Adaptive system that prioritizes words you haven't seen before
- **Vocabulary Practice**: Interactive word games with definitions, examples, and translations
- **Pronunciation Practice**: Listen to word pronunciations and test your understanding
- **Leaderboards**: Compete with other users on vocabulary scores
- **Mobile Responsive**: Optimized experience across all device sizes
- **User Authentication**: Secure login with Google or email
- **Multilingual Support**: Full internationalization with English and Vietnamese languages
- **Accessibility**: ARIA-compliant components for better screen reader support

## Tech Stack

### Frontend
- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Type safety and improved developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Shadcn UI** - Component library built on Radix UI
- **Lucide Icons** - Beautiful, consistent icon set
- **React Query** - Data fetching and state management
- **date-fns** - Date manipulation library
- **Canvas Confetti** - Visual effects for achievements

### Backend
- **Firebase** - Authentication, Firestore database, and hosting
- **OpenAI** - AI integration for quiz generation and text-to-speech functionality
- **Langchain** - LLM framework for structured AI interactions

### Authentication
- **Firebase Auth** - User authentication and management

### Data Visualization
- **React Heat Map** - Activity visualization
- **React Tooltip** - Enhanced user interaction
- **Progress Bars** - Visual representation of performance metrics

### Testing & Deployment
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD workflows

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MichelDevWeb/Aquizi.git
cd Aquizi
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI
OPENAI_API_KEY=
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── (user)/           # User routes (dashboard, etc.)
│   ├── api/              # API routes
│   │   ├── quiz/         # Quiz-related API endpoints
│   │   └── vocabulary/   # Vocabulary-related API endpoints
│   └── actions/          # Server actions
├── components/           # Reusable components
│   ├── dashboard/        # Dashboard-specific components
│   ├── statistics/       # Statistics and visualization components
│   └── ui/               # UI components (shadcn)
├── contexts/             # React contexts (auth, language, etc.)
├── lib/                  # Utility functions and configurations
│   ├── firebase/         # Firebase configuration
│   ├── firestore/        # Firestore utilities
│   └── utils.ts          # General utilities
├── translations/         # Language files for internationalization
└── schemas/              # Zod schemas for validation
```

## Recent Improvements

- **Smart Vocabulary Learning**: Added adaptive learning system that prioritizes words users haven't seen before
- **Vocabulary Learning Feature**: Added interactive vocabulary practice with definitions, examples, and translations
- **Text-to-Speech Integration**: Added pronunciation support for vocabulary words
- **Vocabulary Dashboard**: Track vocabulary learning progress with detailed metrics
- **Leaderboard System**: Compete with other users on vocabulary scores
- **Multilingual Support**: Added complete internationalization with English and Vietnamese languages
- **Enhanced Mobile Navigation**: Improved mobile navigation with fixed-width icons and better touch targets
- **Accessibility Enhancements**: Added ARIA labels and improved keyboard navigation
- **Streamlined UI**: Cleaner interface with consistent spacing and typography
- **Enhanced Dashboard**: Improved UI/UX with tabbed interface and better organization
- **Mobile Responsiveness**: Optimized for all device sizes with responsive layouts
- **Quiz Experience**: Added randomized answer options and improved question flow
- **Performance Tracking**: Enhanced statistics with detailed time tracking for retests
- **Visual Feedback**: Added sound effects and visual indicators for correct/incorrect answers
- **Enhanced Data Visualization**: Added intuitive icons for better data representation in the vocabulary section, including checkmarks for correct answers, X marks for incorrect answers, and streak indicators for consecutive correct answers
- **Interactive UI Elements**: Implemented tooltips, popovers, and keyboard shortcut indicators to improve user experience
- **Translation System**: Added on-demand translation functionality for definitions and examples with Vietnamese translations, allowing users to toggle between languages
- **Visual Progress Tracking**: Implemented progress bars and visual indicators to show completion status and performance metrics
- **Streak Rewards System**: Added a streak counter with visual feedback and bonus points for consecutive correct answers
- **Keyboard Navigation**: Enhanced accessibility with keyboard shortcuts for all major actions (Enter, P for pronunciation, H for hints)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Michel Nguyen - [LinkedIn](https://www.linkedin.com/in/michel-nguyen-407950144/) | [Twitter](https://x.com/NguyenMich67756)

Project Link: [https://github.com/MichelDevWeb/Aquizi](https://github.com/MichelDevWeb/Aquizi)
