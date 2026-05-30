# Templars - React Application

A modern React 19 application built with Vite and TypeScript.

## 🚀 Getting Started

### Development
```bash
npm run dev
```
The application will start on `http://localhost:5173/`

### Production Build
```bash
npm run build
```
This creates an optimized build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Code Quality
```bash
npm run lint
```

## 📦 Dependencies
- React 19.2.6
- React DOM 19.2.6
- Vite 8.0.12
- TypeScript

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Framework: "Vite" will be auto-detected
6. Deploy!

**Automatic deployments:**
- Every push to `main` branch deploys to production
- Pull requests create preview deployments

### Option 2: Netlify
1. Push your code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "New site from Git"
4. Select your GitHub repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy!

### Option 3: GitHub Pages
1. Update `vite.config.ts` to set `base: '/repository-name/'`
2. Push to GitHub
3. GitHub Actions will automatically build and deploy
4. Enable GitHub Pages in repository settings (source: GitHub Actions)

### Option 4: Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and run:
```bash
docker build -t templars:latest .
docker run -p 3000:3000 templars:latest
```

## 📝 Project Structure
```
templars/
├── src/
│   ├── App.tsx          # Main component
│   ├── App.css          # App styles
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Vercel deployment config
├── netlify.toml         # Netlify deployment config
└── package.json         # Dependencies
```

## 🔐 Environment Variables
Create a `.env.local` file for local development:
```env
VITE_API_URL=http://localhost:3000
```

Access in your code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📚 Resources
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🛠️ Commands Reference
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint and check code quality |

## 📄 License
MIT
