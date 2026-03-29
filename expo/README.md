# Period Tracking App

A full-featured period tracking app built with React Native, Expo, and Supabase.

## Features

- **Period & Fertility Tracking**: Track your menstrual cycle, predict future periods, and identify fertile windows
- **Symptoms Tracking**: Log daily symptoms including mood, pain, body changes, and more
- **Pregnancy Mode**: Switch to pregnancy-focused tracking when needed
- **Health Insights**: Get personalized insights about your cycle patterns
- **Education**: Access health articles and educational content
- **Secure Authentication**: User accounts with secure data storage
- **Cross-platform**: Works on iOS, Android, and Web

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Authentication**: Supabase Auth
- **API**: tRPC for type-safe API calls
- **State Management**: React Query + Context API
- **UI**: Custom components with Lucide React Native icons

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_RORK_API_BASE_URL=your_api_base_url
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
3. This will create all necessary tables, policies, and indexes

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run start

# For web development
npm run start-web
```

## Database Schema

### Tables

- **profiles**: User profile information (cycle length, pregnancy mode, etc.)
- **cycles**: Calculated cycle data based on period logs
- **period_logs**: Daily period flow tracking
- **symptom_logs**: Daily symptom tracking

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies enforce data isolation between users

## API Routes

The app uses tRPC for type-safe API calls:

- `auth.profile.get` - Get user profile
- `auth.profile.update` - Update user profile
- `cycles.periodLogs.get` - Get period logs
- `cycles.periodLogs.add` - Add period log
- `cycles.symptomLogs.get` - Get symptom logs
- `cycles.symptomLogs.add` - Add symptom log
- `cycles.cycles.get` - Get calculated cycles
- `cycles.cycles.update` - Update cycles

## Features in Detail

### Period Tracking
- Log daily flow intensity (light, medium, heavy, spotting)
- Automatic cycle calculation based on period logs
- Period predictions based on historical data

### Fertility Tracking
- Ovulation prediction using cycle data
- Fertile window identification
- Visual calendar with fertility indicators

### Symptoms Tracking
- Categorized symptoms (mood, pain, body, flow, other)
- Daily symptom logging
- Historical symptom patterns

### Pregnancy Mode
- Switches focus from fertility to pregnancy tracking
- Disables fertility predictions
- Pregnancy-specific symptom categories

### Health Insights
- Cycle length analysis
- Period pattern insights
- PMS prediction
- Educational health content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.