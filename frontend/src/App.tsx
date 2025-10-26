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
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'https://collaborative-drawing-app-backend-wz3c.onrender.com';

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
        updated.set(data.id, { id: data.id, x: data.x, y: data.y });
        return updated;
      });
    });

    newSocket.on('clear-canvas', () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    saveToHistory();
  }, []);

  const drawOnCanvas = (data: DrawData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = data.tool === 'eraser' ? '#FFFFFF' : data.color;
    ctx.lineWidth = data.size;
    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      prevPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
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
    socket?.emit('draw', drawData);

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

    socket.emit('cursor-move', { x, y });
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryStep((prev) => prev + 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setHistoryStep((prev) => prev - 1);
    const imageData = history[historyStep - 1];
    ctx.putImageData(imageData, 0, 0);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setHistoryStep((prev) => prev + 1);
    const imageData = history[historyStep + 1];
    ctx.putImageData(imageData, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit('clear-canvas');
    saveToHistory();
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={(e) => {
          draw(e);
          handleMouseMove(e);
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{ display: 'block', cursor: 'crosshair' }}
      />

      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setTool('brush')}
            style={{
              padding: '5px 10px',
              marginRight: '5px',
              backgroundColor: tool === 'brush' ? '#007bff' : '#f0f0f0',
              color: tool === 'brush' ? 'white' : 'black',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Brush
          </button>
          <button
            onClick={() => setTool('eraser')}
            style={{
              padding: '5px 10px',
              backgroundColor: tool === 'eraser' ? '#007bff' : '#f0f0f0',
              color: tool === 'eraser' ? 'white' : 'black',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Eraser
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === 'eraser'}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>Size: {brushSize}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>

        <div>
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            style={{
              padding: '5px 10px',
              marginRight: '5px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '3px',
              cursor: historyStep <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            style={{
              padding: '5px 10px',
              marginRight: '5px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '3px',
              cursor: historyStep >= history.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Redo
          </button>
          <button
            onClick={clearCanvas}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {Array.from(cursors.entries()).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'red',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

export default App;
