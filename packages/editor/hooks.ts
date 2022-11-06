import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_STATE, Point, ShapeType, State } from './state';
import {
    createTempCanvas,
    getLeftNodeHandle,
    getRightNodeHandle,
    redraw,
} from './utils';

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

    const addEdge = useCallback((edge: Edge) => {
        setState((prev) => ({
            ...prev,
            edges: [...prev.edges, edge],
        }));
    }, []);

    const addNode = useCallback((node: Node) => {
        setState((prev) => ({
            ...prev,
            nodes: [...prev.nodes, node],
        }));
    }, []);

    const moveCurrSelection = useCallback(
        (p: Point) => {
            const selectedNode = state.currSelection!.data;
            const node = state.nodes.find((n) => n.id == selectedNode.id);
            p.x = p.x / state.scale - state.translate.x;
            p.y = p.y / state.scale - state.translate.y;
            if (node) {
                if (node.type == 'rectangle') {
                    const x = p.x - 100;
                    const y = p.y - 50;
                    const w = p.x + 100 - x;
                    const h = p.y + 50 - y;
                    (node.options as RectOptions).x = x;
                    (node.options as RectOptions).y = y;
                    (node.options as RectOptions).w = w;
                    (node.options as RectOptions).h = h;
                } else {
                    (node.options as CircleOptions).cx = p.x;
                    (node.options as CircleOptions).cy = p.y;
                    (node.options as CircleOptions).r = 50;
                }
            }
            const nodes = state.nodes.map((n) =>
                node && n.id == node.id ? { ...node } : n
            );
            let edges = state.edges.map((edge) => {
                if (edge.from && node && edge.from == node.id) {
                    const start = getRightNodeHandle(node);
                    return {
                        ...edge,
                        options: {
                            ...edge.options,
                            x1: start.x,
                            y1: start.y,
                        },
                    };
                } else if (edge.to && node && edge.to == node.id) {
                    const end = getLeftNodeHandle(node);
                    return {
                        ...edge,
                        options: {
                            ...edge.options,
                            x2: end.x,
                            y2: end.y,
                        },
                    };
                } else {
                    return edge;
                }
            });
            setState((prev) => ({
                ...prev,
                edges,
                nodes,
            }));
        },
        [state]
    );

    const removeCurrSelection = useCallback(() => {
        // delete edge and return
        if (state.currSelection && state.currSelection.type == 'edge') {
            const edges = state.edges.filter(
                (e) => e.id !== state.currSelection!.id
            );
            setState((prev) => ({ ...prev, edges, currSelection: undefined }));
            return;
        }

        if (state.currSelection && state.currSelection.type == 'node') {
            // delete selected node from nodes
            const nodes = state.nodes.filter(
                (n) => n.id !== state.currSelection!.id
            );

            // delete edges associated width the selected node
            const edges = state.edges.filter(
                (edge) =>
                    !(
                        edge.from == state.currSelection!.id ||
                        edge.to == state.currSelection!.id
                    )
            );

            setState((prev) => ({
                ...prev,
                nodes,
                edges,
                currSelection: undefined,
            }));
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
                        currSelection: {
                            type: 'edge',
                            id: edge.id,
                            data: edge,
                        },
                    }));
                    return;
                }
            }

            for (const node of state.nodes) {
                if (ids.includes(node.id)) {
                    setState((prev) => ({
                        ...prev,
                        currSelection: {
                            type: 'node',
                            id: node.id,
                            data: node,
                        },
                    }));
                    return;
                }
            }
        },
        [state.edges, state.nodes, state.currSelection]
    );

    const setEdgeLabel = useCallback(
        (id: string, label: string) => {
            const edges = state.edges.map((e) => ({
                ...e,
                label: e.id == id ? label : e.label,
            }));

            if (state.currSelection) {
                const curr = {
                    ...state.currSelection,
                    data: { ...state.currSelection.data, label },
                };
                setState((prev) => ({ ...prev, currSelection: curr, edges }));
            }
        },
        [state.currSelection, state.edges]
    );

    const setEdgeData = useCallback(
        (id: string, data: string) => {
            const edges = state.edges.map((e) => ({
                ...e,
                data: e.id == id ? data : e.data,
            }));

            if (state.currSelection) {
                const curr = {
                    ...state.currSelection,
                    data: { ...state.currSelection.data, data },
                };
                setState((prev) => ({ ...prev, currSelection: curr, edges }));
            }
        },
        [state.currSelection, state.edges]
    );

    const setNodeLabel = useCallback(
        (id: string, label: string) => {
            const nodes = state.nodes.map((n) => ({
                ...n,
                label: n.id == id ? label : n.label,
            }));
            if (state.currSelection) {
                const curr = {
                    ...state.currSelection,
                    data: { ...state.currSelection.data, label },
                };
                setState((prev) => ({
                    ...prev,
                    currSelection: curr,
                    nodes,
                }));
            }
        },
        [state.currSelection, state.nodes]
    );

    const setNodeData = useCallback(
        (id: string, data: string) => {
            const nodes = state.nodes.map((n) => ({
                ...n,
                data: n.id == id ? data : n.data,
            }));
            if (state.currSelection) {
                const curr = {
                    ...state.currSelection,
                    data: { ...state.currSelection.data, data },
                };
                setState((prev) => ({
                    ...prev,
                    currSelection: curr,
                    nodes,
                }));
            }
        },
        [state.currSelection, state.nodes]
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
        setNodeLabel,
        setEdgeLabel,
        setNodeData,
        setEdgeData,
        clearCanvas,
    };
};
