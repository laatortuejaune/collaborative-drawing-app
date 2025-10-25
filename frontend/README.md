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
- Backend server running on `http://localhost:5000`

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
│       └── sample2.svg
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind CSS configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js     # PostCSS configuration
```

## 🛠️ Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 5** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **HTML5 Canvas API** - Drawing functionality

## 🎯 Usage

1. **Start the backend server** (ensure it's running on port 5000)
2. **Start the frontend**: `npm run dev`
3. **Open browser**: Navigate to `http://localhost:3000`
4. **Start drawing**:
   - Select a tool (Brush or Eraser)
   - Choose a color
   - Adjust brush size
   - Draw on the canvas
5. **Collaborate**: Open multiple browser windows to see real-time synchronization

## 🔧 Configuration

### Socket.IO Connection

The app connects to the backend via Socket.IO. Configure the server URL in `src/App.tsx`:

```typescript
const newSocket = io('http://localhost:5000');
```

### Vite Proxy

The Vite dev server proxies Socket.IO connections. See `vite.config.ts`:

```typescript
server: {
  port: 3000,
  proxy: {
    '/socket.io': {
      target: 'http://localhost:5000',
      ws: true
    }
  }
}
```

## 📝 Scripts

- `npm run dev` - Start development server
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
- Socket.IO documentation: https://socket.io/
- React documentation: https://react.dev/
- Vite documentation: https://vitejs.dev/
