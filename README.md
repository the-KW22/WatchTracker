# ReelTrack

> Your personal movie and TV show progress tracker

**ReelTrack** is a modern web application that helps you track your watching progress for movies, TV shows, and anime. Never forget where you stopped watching again!

## Features

- **Track Progress** - Record exact timestamps where you stopped watching
- **Visual Progress** - See completion percentage with progress bars
- **Search** - Find movies and TV shows with real TMDB data
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Secure Authentication** - Your data is private and secure
- **Auto-Save** - Never lose your progress
- **Clean UI** - Modern, minimalist design
- **Fast & Smooth** - Built with performance in mind

## Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x500/1a1a1a/ffffff?text=Home+Page)

### Search Movies
![Search](https://via.placeholder.com/800x500/1a1a1a/ffffff?text=Search+Page)

### Track Progress
![Details] (src)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth)
- **API**: TMDB (The Movie Database)
- **Hosting**: Vercel

## 🎯 Use Cases

- **Track TV Shows** - Remember which episode you're on
- **Movie Progress** - Save your exact timestamp
- **Watch Later List** - Add movies you plan to watch
- **Binge Tracking** - Organize your weekend binges
- **Anime Tracker** - Perfect for tracking anime series

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works!)
- TMDB API key (free)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/the-KW22/ReelTracker.git
cd ReelTracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

4. **Set up Supabase database**

Run this SQL in your Supabase SQL editor:

```sql
-- Create tracked_items table
CREATE TABLE tracked_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_url TEXT,
  backdrop_url TEXT,
  media_type TEXT CHECK (media_type IN ('movie', 'tv')),
  current_season INTEGER,
  current_episode INTEGER,
  timestamp_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER,
  status TEXT DEFAULT 'watching' CHECK (status IN ('watching', 'completed', 'on-hold', 'plan-to-watch')),
  last_watched_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tracked_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own items" ON tracked_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON tracked_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON tracked_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON tracked_items FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_tracked_items_user_id ON tracked_items(user_id);
CREATE INDEX idx_tracked_items_status ON tracked_items(status);
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173` and start tracking! 🎉

## 📝 How to Use

1. **Sign Up** - Create a free account
2. **Search** - Find your favorite movies or TV shows
3. **Add to Library** - Click to add to your watchlist
4. **Track Progress** - Set your current timestamp
5. **Update Status** - Mark as watching, completed, or on-hold
6. **Add Notes** - Write your thoughts about the show

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Vercel](https://vercel.com/) for hosting

## 📧 Contact

Have questions or suggestions? Feel free to reach out!

- **GitHub**: [@yourusername](https://github.com/the-KW22)
- **Email**: the.kw22me@gmail.com

## ⚖️ Terms & Privacy

By using ReelTrack, you agree to our [Terms & Conditions](TERMS.md) and [Privacy Policy](PRIVACY.md).

---

**Made with ❤️ for movie and TV show enthusiasts**

⭐ Star this repo if you find it helpful!