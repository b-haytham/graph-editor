import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, State } from './state';
import { redraw } from './utils';

import {
    drawElements,
    fakeElements,
    Element as EditorElement,
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
            const container = entries[0];
            setState((prev) => ({
                ...prev,
                width: container.contentRect.width,
                height: container.contentRect.height,
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
            redraw(state, canvasRef.current, contextRef.current, elements);
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

    const setSelectedShape = useCallback((shape: Shape | null) => {
        setState((prev) => ({
            ...prev,
            selectedShape: shape ? 'rectange' : undefined,
        }));
    }, []);

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
    };
};
