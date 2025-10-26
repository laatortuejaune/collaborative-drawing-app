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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://collaborative-drawing-app-backend-wz3c.onrender.com';
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to backend:', backendUrl);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('draw', (data: DrawData) => {
      drawOnCanvas(data);
    });

    newSocket.on('cursor-move', (data: CursorData) => {
      setCursors((prev) => {
        const updated = new Map(prev);
        updated.set(data.id, { x: data.x, y: data.y });
        return updated;
      });
    });

    newSocket.on('clear-canvas', () => {
      clearCanvas();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), imageData]);
    setHistoryStep((prev) => prev + 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryStep((prev) => prev - 1);
      ctx.putImageData(history[historyStep - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryStep((prev) => prev + 1);
      ctx.putImageData(history[historyStep + 1], 0, 0);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    prevPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const drawData: DrawData = {
      x,
      y,
      prevX: prevPos.current.x,
      prevY: prevPos.current.y,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      size: brushSize,
      tool,
    };

    drawOnCanvas(drawData);

    if (socket) {
      socket.emit('draw', drawData);
    }

    prevPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const drawOnCanvas = (data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleClear = () => {
    clearCanvas();
    saveToHistory();
    if (socket) {
      socket.emit('clear-canvas');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (socket) {
      socket.emit('cursor-move', { x, y });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-72 bg-white shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-800">Drawing App</h1>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-600">TOOL</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTool('brush')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                tool === 'brush'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                tool === 'eraser'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Eraser
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-600">COLOR</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser'}
            className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-600">
            BRUSH SIZE: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition"
        >
          Clear Canvas
        </button>

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

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-600">TEMPLATES</h2>
          <p className="text-xs text-gray-500">Load predefined drawings from /public/drawings</p>
        </div>
      </div>

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
        ></canvas>
        {Array.from(cursors.entries()).map(([id, cursor]) => (
          <div
            key={id}
            className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
            style={{ left: cursor.x, top: cursor.y }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default App;
