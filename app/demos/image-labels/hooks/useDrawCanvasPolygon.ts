import { useState, useCallback, useEffect } from 'react';
import { getScaledCoordinates } from '@/app/demos/image-labels/utils/canvasDrawing';
import { BoundingBox } from '@/app/demos/image-labels/type';

export interface Point {
  x: number;
  y: number;
};

export interface Polygon {
  id: string;
  points: Point[];
  isComplete: boolean;
  color?: string;
  type: 'polygon';
  label: string;
};

export interface BoundingBoxWithType extends BoundingBox {
  type: 'box';
};

export type Shape = BoundingBoxWithType | Polygon;


interface UseCanvasPolygonProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPolygonComplete: (polygon: Omit<Polygon, 'type'>) => void;
  onLabelRequest: () => void;
  distanceInPxToCloseShape: number;
  isActive?: boolean;
}

export function useDrawCanvasPolygon({
  canvasRef,
  onPolygonComplete,
  onLabelRequest,
  distanceInPxToCloseShape = 10,
  isActive = true,
}: UseCanvasPolygonProps) {
  // state
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);
  const [pendingPolygon, setPendingPolygon] = useState<Omit<Polygon, 'type'> | null>(null);

  // generate unique ID for new polygon
 const generatePolygonId = useCallback(() => {
    return `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // start new polygon
  const startDrawingPolygon = useCallback(() => {
    if (!isActive) return;

    setCurrentPoints([]);
    setIsDrawing(true);
    setCurrentPolygonId(generatePolygonId());
  }, [isActive, generatePolygonId]);

  // complete drawing the polygon
  const completePolygon = useCallback(() => {
    // if we're drawing or we can't close the shape or we don't have an id, quit
    if ( !isDrawing || currentPoints.length < 3 || !currentPolygonId) return;

    // create a polygon obj to save
    const completedPolygon: Omit<Polygon, 'type'> = {
      id: currentPolygonId,
      points: [...currentPoints],
      isComplete: true,
      label: 'POLYGON',
      color: '#007bff',
    };

    // Store polygon and request label
    setPendingPolygon(completedPolygon);

    // Set complete state but keep points for visual display
    setIsComplete(true);
    setIsDrawing(false);

    // Request label from parent
    onLabelRequest();

  }, [isDrawing, currentPoints, currentPolygonId, onLabelRequest]);

  // complete polygon with a specific label
  const completeWithLabel = useCallback((label: string) => {
    if (!pendingPolygon) return;

    const completedPolygon = {
      ...pendingPolygon,
      label,
    };

    // Call the completion callback
    onPolygonComplete(completedPolygon);

    // Clear all state after labeling
    setPendingPolygon(null);
    setCurrentPoints([]);
    setIsComplete(false);
    setCurrentPolygonId(null);
  }, [pendingPolygon, onPolygonComplete]);

  // cancel drawing the current polygon
  const cancelPolygon = useCallback(() => {
    setCurrentPoints([]);
    setIsDrawing(false);
    setIsComplete(false);
    setCurrentPolygonId(null);
  } ,[]);


  const drawPoint = useCallback((point: Point) => {
    // if we're not drawing or not active, return
    if (!isDrawing || !isActive) return;

    // closed shapes must have at least 3 points
    if (currentPoints.length > 2) {
      const firstPoint = currentPoints[0];
      const distanceFromFirstPoint = Math.sqrt(
        Math.pow(point.x - firstPoint.x, 2) +
        Math.pow(point.y - firstPoint.y, 2)
      );

      // close the shape if we've clicked near the starting node
      if (distanceFromFirstPoint < distanceInPxToCloseShape) {
        completePolygon();
        return true;
      }
    }

    // set shape in state
    setCurrentPoints(prev => [...prev, point])
    return false;
  }, [currentPoints, isDrawing, isActive, distanceInPxToCloseShape, completePolygon]);

  // handle clicking on the canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('handleCanvasClick called! isActive:', isActive, 'isDrawing:', isDrawing);

    if (!isActive) {
      console.log('Polygon hook not active, returning');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas ref, returning');
      return;
    }

    const point = getScaledCoordinates(e, canvas);
    console.log('Got point:', point);

    // start drawing polygon if we're not currently drawing
    if (!isDrawing) {
      console.log('Starting new polygon');
      startDrawingPolygon();
      setCurrentPoints([point]);
      return;
    }

    console.log('Adding point to existing polygon');
    // add point to the current polygon
    drawPoint(point);

  }, [canvasRef, isActive, isDrawing, startDrawingPolygon, drawPoint]);

  // handle drawing the polygon on the canvas
  const drawCurrentPolygon = useCallback((ctx: CanvasRenderingContext2D) => {
    console.log('drawCurrentPolygon called with', currentPoints.length, 'points');
    // if we don't have any points, quit
    if (currentPoints.length === 0) return;

    // draw polygon lines
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

    // create a path of nodes for lines to connect
    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }
    // Close the shape if complete (like the working proof of concept)
    if (isComplete) {
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
      ctx.fill();
    }

    // style the lines and paint them on the canvas (green when complete, blue when drawing)
    ctx.strokeStyle = isComplete ? '#28a745' : '#007bff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // draw the points as circles
    currentPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);

      // first point is green, others are red
      ctx.fillStyle = index === 0 ? '#28a745' : '#dc3545';
      ctx.fill();

      // set gray border
      ctx.strokeStyle = '#f9f9f9';
      ctx.lineWidth = 2;
      ctx.stroke();
    })

    // only try to close the shape if we have at least 3 points
    if (currentPoints.length > 2) {
      const firstPoint = currentPoints[0];

      // draw a larger circle around first point to show that we can close the shape
      ctx.beginPath();
      ctx.arc(
        firstPoint.x, firstPoint.y, distanceInPxToCloseShape, 0, Math.PI * 2
      );
      ctx.strokeStyle = 'rgba(40, 167, 69, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [currentPoints, isComplete, distanceInPxToCloseShape]);

  // get the cursor style based on the state
  const getCursorStyle = useCallback(() => {
    if (!isActive) return 'default';
    if (!isDrawing) return 'move';
    if (currentPoints.length > 2) return 'pointer';

    return 'move';
  }, [isActive, isDrawing, currentPoints.length])

  // get the status message
  const getStatusMessage = useCallback(() => {
    if (!isActive) return 'Polygon tool inactive';
    if (!isDrawing) return 'Click to start drawing a polygon';
    if (currentPoints.length === 0) return 'Click on the canvas to place the first polygon point';
    if (currentPoints.length < 3) return `${currentPoints.length} placed. We need at least 3 to close the shape.`;

    return `${currentPoints.length} points placed. Click near the first point to close the shape.`

  }, [isActive, isDrawing, currentPoints.length]);

  // Auto-draw polygon when points change
  useEffect(() => {
    if (currentPoints.length > 0 && isActive) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        console.log('Auto-drawing polygon with', currentPoints.length, 'points');
        drawCurrentPolygon(ctx);
      }
    }
  }, [currentPoints, isActive, canvasRef, drawCurrentPolygon]);

  return {
    // state
    currentPoints,
    isDrawing,
    currentPolygonId,
    pendingPolygon,

    // actions
    handleCanvasClick,
    startDrawingPolygon,
    completePolygon,
    completeWithLabel,
    cancelPolygon,

    // drawing
    drawCurrentPolygon,

    // ui helper fns
    getCursorStyle,
    getStatusMessage,

    // derived values
    canCompletePolygon: currentPoints.length > 2,
    pointCount: currentPoints.length,
  }
}