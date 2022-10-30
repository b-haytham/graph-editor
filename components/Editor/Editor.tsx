'use client';

import { useEffect, useRef, useState } from "react";
import { drawElements, fakeElements, Element as EditorElement } from './elements';

type State = {
  width: string | number;
  height: string | number;
  scale: number;
  translate: {
    x: number;
    y: number
  }
}

const DEFAULT_STATE: State = {
  width: '100%',
  height: '100%',
  scale: 1,
  translate: {
    x: 0,
    y: 0
  }
}

type EditorProps = {
  initialElements?: EditorElement[]
}

const Editor = ({ initialElements }: EditorProps) => {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [count, setCount] = useState(0);
  const [elements, setElements] = useState<EditorElement[]>(initialElements ? initialElements : fakeElements);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // const observer = useRef(new ResizeObserver((e) => {
  //   setState((prev) => ({
  //     ...prev,
  //     width: e[0].contentRect.width,
  //     height: e[0].contentRect.height
  //   }))
  // }));

  const observer = useRef<ResizeObserver | null>(null);
  useEffect(() => {
    observer.current = new ResizeObserver((e) => {
      setState((prev) => ({
        ...prev,
        width: e[0].contentRect.width,
        height: e[0].contentRect.height
      }))
    })
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('change', (e) => console.log(e));
    }
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('change', (e) => console.log(e))
      }
    }
  }, [canvasRef])

  useEffect(() => {
    if (containerRef.current) {
      observer.current?.observe(containerRef.current);
    }
    return () => {
      containerRef.current && observer.current?.unobserve(containerRef.current);
    }
  }, [containerRef.current, observer.current])

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx!.strokeStyle = "white";
      ctx?.rect(100, 100, 100, 100);
      ctx?.stroke();
      setCanvasCtx(ctx);
      canvasCtxRef.current = ctx!;
    }
  }, [canvasRef.current])

  useEffect(() => {
    if (canvasCtx) {
      console.log(canvasCtx);
      drawElements(canvasCtx, elements);
    }
  }, [canvasCtx])


  const handleWheelEvent = (e: WheelEvent) => {
    if (e.deltaY < 0 && e.ctrlKey && e.altKey) {
      setState((prev) => ({ ...prev, scale: prev.scale - .1 }))
    }
    if (e.deltaY > 0 && e.ctrlKey && e.altKey) {
      setState((prev) => ({ ...prev, scale: prev.scale + .1 }))
    }

    if (e.deltaY > 0 && e.shiftKey) {
      setState((prev) => ({ ...prev, translate: { ...prev.translate, y: prev.translate.y + 10 } }));
    }
    if (e.deltaY < 0 && e.shiftKey) {
      setState((prev) => ({ ...prev, translate: { ...prev.translate, y: prev.translate.y - 10 } }));
    }

    if (e.deltaX < 0 && e.shiftKey) {
      setState((prev) => ({ ...prev, translate: { ...prev.translate, x: prev.translate.x - 10 } }));
    }

    if (e.deltaX > 0 && e.shiftKey) {
      setState((prev) => ({ ...prev, translate: { ...prev.translate, x: prev.translate.x + 10 } }));
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    console.log(e);
  }

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener('wheel', handleWheelEvent);
      canvasRef.current.addEventListener('mousedown', handleMouseDown);
    }
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('wheel', handleWheelEvent);
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      }
    }
  }, [canvasRef.current])

  useEffect(() => {
    if (canvasCtxRef.current && canvasRef.current) {
      canvasRef.current.style.width = typeof state.width == "string" ? state.width : state.width + "px";
      canvasRef.current.style.height = typeof state.height == "string" ? state.height : state.height + "px";
      canvasRef.current.width = typeof state.width == "number" ? state.width : 0;
      canvasRef.current.height = typeof state.height == "number" ? state.height : 0;
      canvasCtxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtxRef.current.scale(state.scale, state.scale);
      canvasCtxRef.current.translate(state.translate.x, state.translate.y);
      drawElements(canvasCtxRef.current, elements);
    }
  }, [state, canvasCtxRef.current, canvasRef.current])

  return (
    <div ref={containerRef} style={{ position: 'relative', height: "100%", width: '100%' }}>
      <p style={{ position: 'absolute', top: 10, left: 10 }}>Editor..</p>
      <button
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          zIndex: 55555,
        }}
        onClick={() => {
          setState((prev) => ({ ...prev, scale: prev.scale + .1 }))
        }}
      >
        inc {Math.floor(state.scale * 100)}
      </button>

      <button
        style={{
          position: "absolute",
          top: 100,
          left: 10,
          zIndex: 55555,
        }}
        onClick={() => {
          setState((prev) => ({ ...prev, scale: prev.scale - .1 }))
        }}
      >
        dec {Math.floor(state.scale * 100)}
      </button>

      <button
        style={{
          position: "absolute",
          top: 150,
          left: 10,
          zIndex: 55555,
        }}
        onClick={() => {
          setState((prev) => ({ ...DEFAULT_STATE, width: prev.width, height: prev.height }));
        }}
      >
        restore
      </button>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default Editor;
