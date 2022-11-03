import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, Point, ShapeType, State } from './state';
import { createTempCanvas, redraw } from './utils';

import {
    drawElements,
    fakeElements,
    Element as EditorElement,
    ArrowOptions,
    CircleOptions,
    RectOptions,
    ElementOptions,
    ElementType,
} from './elements';
import { Shape } from 'ui/ShapeSelect/types';

export const useEditor = () => {
    const [state, setState] = useState<State>(DEFAULT_STATE);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);

    const [elements, setElements] = useState<EditorElement[]>(fakeElements);

    useEffect(() => {
        let container = containerRef.current;
        resizeObserver.current = new ResizeObserver((entries) => {
            const observedContainer = entries[0];
            setState((prev) => ({
                ...prev,
                width: observedContainer.contentRect.width,
                height: observedContainer.contentRect.height,
            }));
        });

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            contextRef.current = ctx;
        }

        if (containerRef.current && resizeObserver.current) {
            resizeObserver.current.observe(containerRef.current);
        }

        return () => {
            if (container) {
                resizeObserver.current?.unobserve(container);
            }
            resizeObserver.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (canvasRef.current && contextRef.current) {
            // requestAnimationFrame(() => {
            redraw(state, canvasRef.current!, contextRef.current!, elements);
            // });
        }
    }, [state, elements]);

    const zoomIn = useCallback(() => {
        setState((prev) => ({ ...prev, scale: prev.scale + 0.1 }));
    }, []);

    const zoomOut = useCallback(() => {
        setState((prev) => ({
            ...prev,
            scale: prev.scale - 0.1 < 0 ? 0 : prev.scale - 0.1,
        }));
    }, []);

    const zoomReset = useCallback(() => {
        setState((prev) => ({
            ...prev,
            scale: 1,
        }));
    }, []);

    const translate = useCallback((x: number, y: number) => {
        setState((prev) => ({
            ...prev,
            translate: {
                x: prev.translate.x + x,
                y: prev.translate.y + y,
            },
        }));
    }, []);

    const refresh = useCallback(() => {
        if (canvasRef.current && contextRef.current) {
            // requestAnimationFrame(() => {
            redraw(state, canvasRef.current!, contextRef.current!, elements);
            // });
        }
    }, [elements, state]);

    const clearCanvas = useCallback(() => {
        setElements((_) => []);
    }, []);

    const setSelectedShape = useCallback((shape: Shape | null) => {
        setState((prev) => ({
            ...prev,
            selectedShape: shape
                ? (shape.label as string as ShapeType)
                : undefined,
        }));
    }, []);

    const setPressPosition = useCallback((p: Point | null) => {
        setState((prev) => ({
            ...prev,
            pressing: p ? true : false,
            pressPosition: p ? p : undefined,
        }));
    }, []);

    const addEdge = useCallback((opt: ArrowOptions) => {
        setElements((prev) => [...prev, { type: 'arrow', options: opt }]);
    }, []);

    const addNode = useCallback(
        (type: ElementType, opt: CircleOptions | RectOptions) => {
            setElements((prev) => [
                ...prev,
                { type, options: opt as ElementOptions },
            ]);
        },
        []
    );

    const findNode = (p: Point): EditorElement[] => {
        console.log('asjfkahsflknaslknlkaslkfn00');
        const elems: EditorElement[] = [];

        const { ctx } = createTempCanvas(state);
        for (const el of elements) {
            if (el.type == 'circle') {
                const opt = el.options as CircleOptions;
                const path = new Path2D();
                path.arc(opt.cx, opt.cy, opt.r, 0, Math.PI * 2);
                ctx?.fill(path);
                const inPath = ctx?.isPointInPath(path, p.x, p.y);
                if (inPath) {
                    console.log('IN PATH =>>', el);
                    elems.push(el);
                }
            } else if (el.type == 'rect') {
                const opt = el.options as RectOptions;
                const path = new Path2D();
                path.rect(opt.x, opt.y, opt.w, opt.h);
                ctx?.fill(path);
                const inPath = ctx?.isPointInPath(path, p.x, p.y);
                if (inPath) {
                    console.log('IN PATH =>>', el);
                    elems.push(el);
                }
            } else if (el.type == 'arrow') {
                const opt = el.options as ArrowOptions;
                const path = new Path2D();
                path.moveTo(opt.x1, opt.y1);
                path.lineTo(opt.x2, opt.y2);
                ctx?.stroke(path);
                const inPath = ctx?.isPointInStroke(path, p.x, p.y);
                if (inPath) {
                    console.log('IN PATH =>>', el);
                    elems.push(el);
                }
            }
        }
        return elems;
    };

    console.log('Elements >> ', elements);
    return {
        canvasRef,
        containerRef,
        contextRef,
        state,
        zoomIn,
        zoomOut,
        zoomReset,
        translate,
        setSelectedShape,
        setPressPosition,
        addEdge,
        addNode,
        findNode,
        refresh,
        clearCanvas,
    };
};
