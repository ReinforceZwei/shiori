![Shiori Logo](shiori-chan-banner.png)

# 栞ちゃん Shiori Chan

A modern, beautiful bookmark manager built with Next.js that helps you organize and access your favorite websites with style.

## What is this?

- A self-hosted bookmark manager web application
- Carry your bookmarks with you, accessible from any device, no more browser lock-in
- Homepage for your browser to quick access to your favorite sites
- Focused on user experience, customization, and performance
- _Very Cute_ mascot named "Shiori-chan" (栞ちゃん)

## This is not...

- A browser extension to manage bookmarks
- A web clipper
- A read-it-later service

Shiori don't save the actual webpage content, only the bookmark link.

## ✨ Features

### 📚 Bookmark Management
- **Create & Edit Bookmarks**: Save URLs with titles, descriptions, and automatically fetched metadata
- **Website Icons**: Automatically fetch and store website favicons
- **Smart Organization**: Group bookmarks into collections with custom colors and descriptions
- **Bulk Import**: Import bookmarks from browser export files (JSON format)

### 🎨 Flexible Layouts
- **Launcher Mode**: A launcher-style grid interface with customizable density and visual effects
- **Grid & List Views**: Additional layout modes for different preferences (more coming soon)
- **Customizable Spacing**: Control item density and spacing to match your preference

### 🔍 Search & Discovery
- **Spotlight Search**: Quickly find bookmarks with a powerful search interface (⌘K / Ctrl+K)
- **Real-time Results**: Instant search results as you type

### 🎭 Personalization
- **Custom Wallpapers**: Upload and manage multiple background images with device-specific targeting
- **Wallpaper Controls**: Fine-tune opacity, blur, size, position, and repeat settings for each wallpaper
- **Dark/Light Theme**: Built-in theme switching for comfortable viewing
- **Layout Customization**: Adjust collection opacity, blur effects, and more

### 🌍 Internationalization
- **Multi-language Support**: 
  - English (en-US)
  - Traditional Chinese (zh-Hant)
- Translation ready, contribution welcome!

### 📱 Responsive Design
- **Mobile & Desktop**: Optimized for all device sizes, PWA ready
- **Device-specific Wallpapers**: Set different wallpapers for mobile and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (recommended for both dev and production)
- PostgreSQL 16 (if not using Docker)

<!-- ### Environment Variables

Create a `.env` file in the project root based on `example.env`:

```bash
# Database connection
DATABASE_URL=postgresql://shiori:shiori_password@localhost:5432/shiori

# Better Auth configuration (generate a secure random string!)
BETTER_AUTH_SECRET=your-very-secure-secret-key-change-this
BETTER_AUTH_URL=http://localhost:3000
```

**Important**: Generate a secure random string for `BETTER_AUTH_SECRET` in production! -->

### 🐳 Docker Compose Deployment (Recommended)

#### Production Deployment

The easiest way to deploy Shiori is using this [Docker Compose file](docker-compose.prod.yml):

```bash
# 1. Create environment file
cp docker_env.txt .env

# 2. Generate random secret using openssl (optional)
#    or use your own random secret
openssl rand -base64 32

# 3. Edit .env and set your values:
#    - DB_PASSWORD: Database password
#    - BETTER_AUTH_SECRET: Your secret key
#    - BETTER_AUTH_URL: Your public URL (e.g., https://shiori.yourdomain.com)
#    - APP_PORT: Port to expose (default: 3000)

# 3. Start the application
docker compose -f docker-compose.prod.yml up -d
```

The production setup includes:
- PostgreSQL 16 database with persistent storage
- Automatic database migrations
- Production-optimized Next.js build
- Health checks for reliability

Access the application at `http://localhost:3000` (or your configured `APP_PORT`).


### 💻 Local Development


```bash
# 1. Setup environment variables
cp example.env .env

# 2. Install dependencies
npm install

# 3. Set up database (ensure PostgreSQL is running)
npm run db:push

# 4. Generate Prisma client
npm run db:gen

# 5. Run database migrations
npm run migrate:deploy

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.


## 📖 Usage

### First Time Setup

1. Navigate to the signup page and create your account
2. Sign in with your credentials
3. Start adding bookmarks or import from your browser

### Adding Bookmarks

- Click the "+" button in the navigation bar
- Enter a URL - metadata will be fetched automatically
- Choose a collection (optional)
- Customize title and description if needed

### Creating Collections

- Use the "Create New Collection" button
- Give it a name, description, and color
- Organize your bookmarks by dragging them into collections

### Importing Bookmarks

1. Export bookmarks from your browser in JSON format
2. Navigate to the Import page
3. Upload your bookmark file
4. Select target collections for each bookmark group
5. Click import

### Customizing Appearance

Visit Settings to:
- Change theme (dark/light)
- Switch language
- Upload custom wallpapers
- Adjust layout mode and density
- Configure collection visual effects

## 🌐 Adding Translations

To add a new language:

1. Create a new JSON file in [`messages/`](messages) (e.g., `messages/fr-FR.json`)
2. Copy the structure from `messages/en-US.json`
3. Translate all strings
4. The language will be automatically available in settings

Translation files use a nested JSON structure with keys for each UI component and message.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [Mantine 8](https://mantine.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📝 License

This project is open source. Please check the license file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI powered by [Mantine](https://mantine.dev/)
- Icons from [Tabler Icons](https://tabler.io/icons)
- Favicon fetching via [@reinforcezwei/favicon-fetcher](https://www.npmjs.com/package/@reinforcezwei/favicon-fetcher)

---

Made with ❤️ for better bookmark management
