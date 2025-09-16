# 📅 Calendar Scheduler

A modern scheduling application built with Next.js that enables sellers to share their calendar availability and buyers to book appointments through seamless Google Calendar integration.

## 🚀 Live Demo

[https://your-app.vercel.app](https://your-app.vercel.app) (Replace with your actual deployment URL)

## ✨ Features

- **Google OAuth Authentication**: Secure sign-in for both sellers and buyers
- **Real-time Calendar Integration**: Fetches availability from Google Calendar
- **Automatic Event Creation**: Books appointments in both parties' calendars
- **Google Meet Integration**: Automatically adds video meeting links
- **Role-based Access**: Switch between buyer and seller modes
- **Appointment Management**: View, track, and cancel appointments
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Availability**: Shows actual available time slots

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Calendar API**: Google Calendar API
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18 or later
- Google Cloud Console account
- Supabase account
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/calendar-scheduler.git
cd calendar-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-vercel-app.vercel.app/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 4. Set Up Supabase

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Go to SQL Editor and run this schema:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller')),
  google_access_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  google_event_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_seller ON appointments(seller_id);
CREATE INDEX idx_appointments_buyer ON appointments(buyer_id);
```

3. Get your database URL and anon key from Settings > API

### 5. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

Update `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and import your repository
3. Add environment variables in the Vercel dashboard:
   ```env
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-generated-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-key
   ```
4. Update Google OAuth redirect URLs with your Vercel domain
5. Deploy!

## 📱 How to Use

### For Sellers:
1. Sign in with Google
2. Switch to "Seller" mode from the dashboard
3. Your calendar availability is now accessible to buyers
4. Manage appointments from the seller dashboard

### For Buyers:
1. Sign in with Google
2. Browse available sellers
3. Select a seller and choose from available time slots
4. Confirm booking - events are created in both calendars
5. Join meetings using the Google Meet link

## 🏗️ Project Structure

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── appointments/  # Appointment management
│   │   ├── calendar/      # Calendar operations
│   │   ├── sellers/       # Seller listings
│   │   └── user/          # User management
│   ├── appointments/      # Appointments page
│   ├── buyer/            # Buyer dashboard
│   ├── seller/           # Seller dashboard
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                 # Utility functions
│   ├── calendar.ts      # Google Calendar service
│   └── database.ts      # Database operations
└── types/               # TypeScript type definitions
```

## 🔧 API Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `GET /api/sellers` - List all sellers
- `POST /api/calendar/availability` - Get seller availability
- `POST /api/calendar/book` - Book an appointment
- `GET /api/appointments` - Get user's appointments
- `PATCH /api/appointments` - Update appointment status
- `POST /api/user/role` - Update user role

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## 🐛 Troubleshooting

### Common Issues:

**"Cannot find module '@/lib/calendar'"**
- Ensure your `tsconfig.json` has the correct path mapping
- Restart your TypeScript server

**Google Calendar API errors**
- Check that the Calendar API is enabled in Google Cloud Console
- Verify OAuth scopes include calendar permissions
- Ensure redirect URLs match exactly

**Database connection issues**
- Verify Supabase URL and key are correct
- Check that database tables are created
- Ensure RLS policies allow operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Google Calendar API for seamless integration
- Supabase for the excellent database service
- Tailwind CSS for beautiful styling

## 📞 Support

If you have questions or need help, please:
- Check the troubleshooting section
- Open an issue on GitHub
- Review the documentation

---

Built with ❤️ using Next.js, TypeScript, and Google Calendar API