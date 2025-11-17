import { useState, useCallback, useEffect } from 'react';

// Utils
import { getScaledCoordinates } from '@/app/demos/image-labels/utils/canvasDrawing';

// Types
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
  distanceInPxToCloseShape: number;
  isActive?: boolean;
  drawnShapes?: Shape[];
  currentTool?: string;
  onPolygonComplete: (polygon: Omit<Polygon, 'type'>) => void;
  onLabelRequest: () => void;
  onPolygonUpdate?: (polygonId: string, updates: Partial<Polygon>) => void;
  drawBoxes?: () => void;
}

/*
  Hook for drawing and dragging polygons on canvas.
  Handles polygon creation by clicking points and dragging with cursor tool.
 */
export function useDrawCanvasPolygon({
  canvasRef,
  onPolygonComplete,
  onLabelRequest,
  distanceInPxToCloseShape = 10,
  isActive = true,
  onPolygonUpdate,
  drawnShapes = [],
  currentTool = 'polygon',
  drawBoxes,
}: UseCanvasPolygonProps) {
  // state
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPolygonId, setCurrentPolygonId] = useState<string | null>(null);
  const [pendingPolygon, setPendingPolygon] = useState<Omit<Polygon, 'type'> | null>(null);

  // Drag state for cursor tool
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPolygon, setDraggedPolygon] = useState<Polygon | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);

  // generate unique ID for new polygon
 const generatePolygonId = useCallback(() => {
    return `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // check if a point is inside a polygon using ray casting algorithm
  // description example: (https://people.utm.my/shahabuddin/?p=6277)
  const isPointWithinPolygon = useCallback((point: Point, polygon: Polygon): boolean => {
    // Unpack the point's coordinates
    const { x: targetPointX, y: targetPointY } = point;

    // List of polygon corners
    const corners = polygon.points;

    // Start by assuming the point is outside the polygon
    let isWithinPolygon = false;

    // Walk around the polygon, checking one edge at a time
    for (
      let currCorner = 0, prevCorner = corners.length - 1;
      currCorner < corners.length;
      prevCorner = currCorner++
    ) {
      const currX = corners[currCorner].x;
      const currY = corners[currCorner].y;
      const prevX = corners[prevCorner].x;
      const prevY = corners[prevCorner].y;

     // Q1: Does the targetPoint's y position sit between the positions two corners' y position?
      const pointIsBetweenCornerYs = (currY > targetPointY) !== (prevY > targetPointY);

      if (pointIsBetweenCornerYs) {
        // Q2: If yes, is the targetPoint's x value less than the potential value of the area between the two corners?
        // aka (is there a line in front of the target point)
        const edgeCrossingX = (prevX - currX) * (targetPointY - currY) / (prevY - currY) + currX;

        if (targetPointX < edgeCrossingX) {
          // Flip inside/outside every time the ray hits an edge
          isWithinPolygon = !isWithinPolygon;
        }
      }
    }

    return isWithinPolygon;
  }, []);


  // Find where the polygon is on the canvas
  const getPolygonAtPosition = useCallback((x: number, y: number): Polygon | null => {
    const currPoint = { x, y };

    // Check drawn polygons starting at most recently added
    for (let i = drawnShapes.length - 1; i >= 0; i--) {
      const currShape = drawnShapes[i];

      if (currShape.type === 'polygon' && isPointWithinPolygon(currPoint, currShape as Polygon)) {
        return currShape as Polygon;
      }
    }

    return null
  }, [drawnShapes, isPointWithinPolygon]);


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
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>): boolean => {
    console.log('handleCanvasClick called! isActive:', isActive, 'isDrawing:', isDrawing, 'currentTool:', currentTool);

    if (!isActive) {
      console.log('Polygon hook not active, returning');
      return false;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas ref, returning');
      return false;
    }

    const point = getScaledCoordinates(e, canvas);
    console.log('Got point:', point);

    // Handle cursor tool - check for polygon dragging
    if (currentTool === 'cursor') {
      const clickedPolygon = getPolygonAtPosition(point.x, point.y);

      if (clickedPolygon && onPolygonUpdate) {
        console.log('Starting drag for polygon:', clickedPolygon.id);

        setDraggedPolygon(clickedPolygon);
        setIsDragging(true);

        // Calculate offset from polygon center
        const centerX = clickedPolygon.points.reduce((sum, p) => sum + p.x, 0) / clickedPolygon.points.length;
        const centerY = clickedPolygon.points.reduce((sum, p) => sum + p.y, 0) / clickedPolygon.points.length;

        setDragOffset({ x: point.x - centerX, y: point.y - centerY });

        // Handled polygon dragging
        return true;
      }

      // No polygon clicked
      return false;
    }

    // Handle polygon drawing tool
    if (currentTool === 'polygon') {
      // start drawing polygon if we're not currently drawing
      if (!isDrawing) {
        console.log('Starting new polygon');

        startDrawingPolygon();
        setCurrentPoints([point]);

        // Handled polygon drawing
        return true;
      }

      console.log('Adding point to existing polygon');

      // add point to the current polygon
      drawPoint(point);

      // Handled polygon drawing
      return true;
    }

    // Didn't handle dragging the polygon
    return false;

  }, [canvasRef, isActive, isDrawing, currentTool, startDrawingPolygon, drawPoint, getPolygonAtPosition, onPolygonUpdate]);

  // handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedPolygon || !dragOffset || !onPolygonUpdate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getScaledCoordinates(e, canvas);

    // Calculate new center position
    const newCenterX = point.x - dragOffset.x;
    const newCenterY = point.y - dragOffset.y;

    // Calculate current center
    const currentCenterX = draggedPolygon.points.reduce((sum, p) => sum + p.x, 0) / draggedPolygon.points.length;
    const currentCenterY = draggedPolygon.points.reduce((sum, p) => sum + p.y, 0) / draggedPolygon.points.length;

    // Calculate offset to apply to all points
    const deltaX = newCenterX - currentCenterX;
    const deltaY = newCenterY - currentCenterY;

    // Update all points
    const newPoints = draggedPolygon.points.map(p => ({
      x: p.x + deltaX,
      y: p.y + deltaY
    }));

    setDraggedPolygon({ ...draggedPolygon, points: newPoints });
  }, [isDragging, draggedPolygon, dragOffset, onPolygonUpdate, canvasRef]);

  // handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    if (isDragging && draggedPolygon && onPolygonUpdate) {
      console.log('Drag ended, final position for polygon:', draggedPolygon.id);
      // Save the final position
      onPolygonUpdate(draggedPolygon.id, { points: draggedPolygon.points });
    }

    setIsDragging(false);
    setDraggedPolygon(null);
    setDragOffset(null);
  }, [isDragging, draggedPolygon, onPolygonUpdate]);

  // handle drawing the polygon on the canvas
  const drawCurrentPolygon = useCallback((ctx: CanvasRenderingContext2D) => {
    console.log('drawCurrentPolygon called with', currentPoints.length, 'points');

    // Drag a draggedPolygon if it exists
    if (draggedPolygon) {
      ctx.beginPath();
      ctx.moveTo(draggedPolygon.points[0].x, draggedPolygon.points[0].y);

      // Create the path of nodes for lines to connect
      for (let i = 1; i < draggedPolygon.points.length; i++) {
        ctx.lineTo(draggedPolygon.points[i].x, draggedPolygon.points[i].y);
      }

      // Close the shape, style it and paint on canvas
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#28a745';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points for dragged polygon
      draggedPolygon.points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#28a745' : '#dc3545';
        ctx.fill();
        ctx.strokeStyle = '#f9f9f9';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

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
  }, [currentPoints, isComplete, distanceInPxToCloseShape, draggedPolygon]);

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

  // Redraw canvas when draggedPolygon changes during dragging
  useEffect(() => {
    if (draggedPolygon && isDragging && drawBoxes) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        // Clear and redraw all shapes
        drawBoxes();

        // Draw the draggedPolygon on top
        drawCurrentPolygon(ctx);
      }
    }
  }, [draggedPolygon, isDragging, canvasRef, drawBoxes, drawCurrentPolygon]);

  return {
    // state
    currentPoints,
    isDrawing,
    isComplete,
    currentPolygonId,
    pendingPolygon,
    isDragging,
    draggedPolygon,

    // actions
    handleCanvasClick,
    handleMouseMove,
    handleMouseUp,
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