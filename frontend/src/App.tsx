import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

type Tool = 'brush' | 'eraser';

interface DrawData {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  size: number;
  tool: Tool;
}

interface CursorData {
  id: string;
  x: number;
  y: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Use environment variable with fallback to Render backend
    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || 'https://collaborative-drawing-app-backend-wz3c.onrender.com';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('draw', (data: DrawData) => {
      drawLine(data.prevX, data.prevY, data.x, data.y, data.color, data.size, data.tool);
    });

    newSocket.on('cursor', (data: CursorData) => {
      setCursors(prev => new Map(prev).set(data.id, data));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const newStep = historyStep - 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const newStep = historyStep + 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, strokeColor: string, strokeSize: number, strokeTool: Tool) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = strokeTool === 'eraser' ? 'white' : strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    prevPos.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLine(prevPos.current.x, prevPos.current.y, x, y, color, brushSize, tool);

    if (socket) {
      socket.emit('draw', {
        x,
        y,
        prevX: prevPos.current.x,
        prevY: prevPos.current.y,
        color,
        size: brushSize,
        tool,
      });
    }

    prevPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit('cursor', { x, y });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="w-72 bg-white shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800">Drawing App</h1>
        
        {/* Tools */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">TOOLS</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTool('brush')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                tool === 'brush'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Eraser
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">COLOR</h2>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer"
          />
        </div>

        {/* Brush Size */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">BRUSH SIZE: {brushSize}px</h2>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">HISTORY</h2>
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redo
            </button>
          </div>
        </div>

        {/* Predefined Drawings */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">TEMPLATES</h2>
          <p className="text-xs text-gray-500">Load predefined drawings from /public/drawings</p>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            draw(e);
            handleMouseMove(e);
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair bg-white"
        />
        {/* Remote cursors */}
        {Array.from(cursors.entries()).map(([id, cursor]) => (
          <div
            key={id}
            className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
            style={{ left: cursor.x, top: cursor.y }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
