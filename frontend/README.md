# Collaborative Drawing App - Frontend

## 🎨 Description
A real-time collaborative drawing application built with React, TypeScript, Vite, Tailwind CSS, and Socket.IO. Multiple users can draw simultaneously on a shared canvas with live cursor tracking and synchronization.

## ✨ Features
- **HTML5 Canvas Drawing**: High-performance drawing with customizable brush sizes
- **Drawing Tools**:
  - Brush tool with adjustable size (1-50px)
  - Eraser tool
  - Color picker
- **Real-time Collaboration**:
  - Live drawing synchronization via Socket.IO
  - Remote cursor tracking
  - Multi-user support
- **Undo/Redo**: Complete history management
- **Predefined Drawings**: Template library in `/public/drawings`
- **Responsive UI**: Modern Tailwind CSS design

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Configuration

The frontend connects to a backend server via Socket.IO. Two configurations are available:

#### Production (Render Deployment)
The application is configured to use the production backend deployed on Render:
- **Backend URL**: `https://collaborative-drawing-app-backend-wz3c.onrender.com`
- This is the default configuration in `.env.example`
- Uses secure HTTPS connection

#### Local Development
For local development with a backend running on your machine:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `REACT_APP_BACKEND_URL` in `.env` to:
   ```
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```
3. Restart the development server

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure
```
frontend/
├── public/
│   └── drawings/          # Predefined sample drawings (SVG)
│       ├── sample1.svg
│       ├── sample2.svg
│       └── sample3.svg
├── src/
│   ├── components/
│   │   ├── Canvas.tsx     # Main canvas component
│   │   ├── Toolbar.tsx    # Drawing tools & controls
│   │   └── Cursors.tsx    # Remote cursor display
│   ├── hooks/
│   │   └── useSocket.ts   # Socket.IO connection hook
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   ├── App.tsx            # Main application
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Dependencies & scripts
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Backend Server URL
REACT_APP_BACKEND_URL=https://collaborative-drawing-app-backend-wz3c.onrender.com
```

## 🛠️ Available Scripts
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Adding Predefined Drawings
Add SVG files to `public/drawings/` to create a template library.

### Styling
Modify Tailwind configuration in `tailwind.config.js` and `src/index.css`.

## 📦 Dependencies

### Production
- react: ^18.2.0
- react-dom: ^18.2.0
- socket.io-client: ^4.7.2

### Development
- @vitejs/plugin-react: ^4.2.1
- typescript: ^5.2.2
- vite: ^5.0.8
- tailwindcss: ^3.3.6
- autoprefixer: ^10.4.16
- postcss: ^8.4.32

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License
MIT License

## 👤 Author
Created with ❤️ for collaborative drawing

## 🔗 Related
- Backend repository: `../backend`
- Production Backend: https://collaborative-drawing-app-backend-wz3c.onrender.com
- Socket.IO documentation: https://socket.io/
- React documentation: https://react.dev/
- Vite documentation: https://vitejs.dev/
