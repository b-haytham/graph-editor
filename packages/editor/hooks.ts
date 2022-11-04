import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, Point, ShapeType, State } from './state';
import { createTempCanvas, redraw } from './utils';

import { ArrowOptions, CircleOptions, RectOptions } from './elements';
import { Shape } from 'ui/ShapeSelect/types';
import { createEdge, Edge } from './edge';
import { createNode, NodeType, Node } from './node';

export const useEditor = () => {
    const [state, setState] = useState<State>(DEFAULT_STATE);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);

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
            redraw(state, canvasRef.current, contextRef.current);
        }
    }, [state]);

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
            redraw(state, canvasRef.current!, contextRef.current!);
        }
    }, [state]);

    const clearCanvas = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currSelection: undefined,
            nodes: [],
            edges: [],
        }));
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
        setState((prev) => ({
            ...prev,
            edges: [...prev.edges, createEdge(opt)],
        }));
    }, []);

    const addNode = useCallback(
        (type: NodeType, opt: CircleOptions | RectOptions) => {
            setState((prev) => ({
                ...prev,
                nodes: [...prev.nodes, createNode(type, opt)],
            }));
        },
        []
    );

    const moveCurrSelection = useCallback(
        (p: Point) => {
            let nodes = state.nodes.map((n) => {
                if (n.id == state.currSelection!.id) {
                    if (n.type == 'rectangle') {
                        const x = p.x - 100;
                        const y = p.y - 50;
                        const w = p.x + 100 - x;
                        const h = p.y + 50 - y;
                        return {
                            ...n,
                            options: {
                                x,
                                y,
                                w,
                                h,
                            },
                        };
                    } else {
                        return {
                            ...n,
                            options: {
                                cx: p.x,
                                cy: p.y,
                                r: 50,
                            },
                        };
                    }
                } else {
                    return n;
                }
            });
            setState((prev) => ({
                ...prev,
                nodes,
            }));
        },
        [state.currSelection, state.nodes]
    );

    const removeCurrSelection = useCallback(() => {
        if (state.currSelection && state.currSelection.type == 'edge') {
            const edges = state.edges.filter(
                (e) => e.id !== state.currSelection!.id
            );
            setState((prev) => ({ ...prev, edges, currSelection: undefined }));
            return;
        }

        if (state.currSelection && state.currSelection.type == 'node') {
            const nodes = state.nodes.filter(
                (n) => n.id !== state.currSelection!.id
            );
            setState((prev) => ({ ...prev, nodes, currSelection: undefined }));
            return;
        }
    }, [state.currSelection, state.edges, state.nodes]);

    const findNode = (p: Point): (Node | Edge)[] => {
        const elems: (Node | Edge)[] = [];

        const { ctx } = createTempCanvas(state);
        for (const edge of state.edges) {
            const opt = edge.options as ArrowOptions;
            const path = new Path2D();
            path.moveTo(opt.x1, opt.y1);
            path.lineTo(opt.x2, opt.y2);
            ctx?.stroke(path);
            const inPath = ctx?.isPointInStroke(path, p.x, p.y);
            if (inPath) {
                elems.push(edge);
            }
        }

        for (const node of state.nodes) {
            if (node.type == 'circle') {
                const opt = node.options as CircleOptions;
                const path = new Path2D();
                path.arc(opt.cx, opt.cy, opt.r, 0, Math.PI * 2);
                ctx?.fill(path);
                const inPath = ctx?.isPointInPath(path, p.x, p.y);
                if (inPath) {
                    elems.push(node);
                }
            } else if (node.type == 'rectangle') {
                const opt = node.options as RectOptions;
                const path = new Path2D();
                path.rect(opt.x, opt.y, opt.w, opt.h);
                ctx?.fill(path);
                const inPath = ctx?.isPointInPath(path, p.x, p.y);
                if (inPath) {
                    elems.push(node);
                }
            }
        }
        return elems;
    };

    const setSelected = useCallback(
        (ids: string[]) => {
            if (state.currSelection && ids.includes(state.currSelection.id)) {
                setState((prev) => ({ ...prev, currSelection: undefined }));
                return;
            }
            for (const edge of state.edges) {
                if (ids.includes(edge.id)) {
                    setState((prev) => ({
                        ...prev,
                        currSelection: { type: 'edge', id: edge.id },
                    }));
                    return;
                }
            }

            for (const node of state.nodes) {
                if (ids.includes(node.id)) {
                    setState((prev) => ({
                        ...prev,
                        currSelection: { type: 'node', id: node.id },
                    }));
                    return;
                }
            }
        },
        [state.edges, state.nodes, state.currSelection]
    );

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
        setSelected,
        moveCurrSelection,
        removeCurrSelection,
        clearCanvas,
    };
};
