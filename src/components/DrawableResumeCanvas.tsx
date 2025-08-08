import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, Eraser, Square, Circle, Palette, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawableResumeCanvasProps {
  resumeUrl: string;
  resumeType: string;
  resumeName: string;
}

export function DrawableResumeCanvas({ resumeUrl, resumeType, resumeName }: DrawableResumeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'select'>('select');
  const [activeColor, setActiveColor] = useState('#ff0080');
  const [brushSize, setBrushSize] = useState(3);

  const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff0000', '#ffff00'];

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: 'transparent',
      selection: false,
    });

    // Set up drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    setFabricCanvas(canvas);

    // Resize canvas to fit container
    const resizeCanvas = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        canvas.setDimensions({ width: containerWidth, height: containerHeight });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleClearDrawings = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.renderAll();
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Drawing Toolbar */}
      <div className="p-3 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-neon-purple border-neon-purple/50">
              Drawing Tools
            </Badge>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('select')}
                className={cn(
                  activeTool === 'select' && 'bg-neon-purple text-white'
                )}
              >
                Select
              </Button>
              <Button
                variant={activeTool === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('draw')}
                className={cn(
                  activeTool === 'draw' && 'bg-neon-pink text-white'
                )}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Color Picker */}
            <div className="flex items-center gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all',
                    activeColor === color 
                      ? 'border-white shadow-lg scale-110' 
                      : 'border-muted-foreground/30 hover:border-white/50'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16"
              />
              <span className="text-sm w-6">{brushSize}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearDrawings}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Resume with Drawing Canvas Overlay */}
      <div ref={containerRef} className="flex-1 relative">
        {/* Resume Background */}
        <div className="absolute inset-0">
          {resumeType === 'application/pdf' ? (
            <iframe
              src={resumeUrl}
              className="w-full h-full border-0"
              title={resumeName}
              style={{ minHeight: '600px' }}
            />
          ) : (
            <img
              src={resumeUrl}
              alt={resumeName}
              className="w-full h-full object-contain"
            />
          )}
        </div>
        
        {/* Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10"
          style={{ pointerEvents: activeTool === 'draw' ? 'auto' : 'none' }}
        />
      </div>
    </div>
  );
}