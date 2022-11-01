'use client';

import { useEffect, useRef, useState } from 'react';
import ShapeSelect from 'ui/ShapeSelect';
import ZoomControl from 'ui/ZoomControl';
import RectIcon from 'ui/Icons/RectIcon';
import ArrowIcon from 'ui/Icons/ArrowIcon';
import CircleIcon from 'ui/Icons/CircleIcon';
import {
    drawElements,
    fakeElements,
    Element as EditorElement,
} from './elements';

type State = {
    width: string | number;
    height: string | number;
    scale: number;
    translate: {
        x: number;
        y: number;
    };
};

const DEFAULT_STATE: State = {
    width: '100%',
    height: '100%',
    scale: 1,
    translate: {
        x: 0,
        y: 0,
    },
};

type EditorProps = {
    initialElements?: EditorElement[];
    zoomControl?: boolean;
};

const Editor = ({ zoomControl, initialElements }: EditorProps) => {
    const [state, setState] = useState<State>(DEFAULT_STATE);
    const [shapes, setShapes] = useState([
        {
            icon: <RectIcon className="h-10 w-10" />,
            label: 'rectangle',
            selected: false,
            onClick: () => console.log('rect clicked'),
        },
        {
            icon: <CircleIcon className="h-10 w-10" />,
            label: 'circle',
            selected: false,
            onClick: () => console.log('circle clicked'),
        },
        {
            icon: <ArrowIcon className="h-10 w-10" />,
            label: 'arrow',
            selected: false,
            onClick: () => console.log('arrow clicked'),
        },
    ]);
    const [elements, setElements] = useState<EditorElement[]>(
        initialElements ? initialElements : fakeElements
    );
    const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
        null
    );
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
                height: e[0].contentRect.height,
            }));
        });
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.addEventListener('change', (e) => console.log(e));
        }
        return () => {
            if (canvasRef.current) {
                canvasRef.current.removeEventListener('change', (e) =>
                    console.log(e)
                );
            }
        };
    }, [canvasRef]);

    useEffect(() => {
        if (containerRef.current) {
            observer.current?.observe(containerRef.current);
        }
        return () => {
            containerRef.current &&
                observer.current?.unobserve(containerRef.current);
        };
    }, [containerRef.current, observer.current]);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx!.strokeStyle = 'white';
            ctx?.rect(100, 100, 100, 100);
            ctx?.stroke();
            setCanvasCtx(ctx);
            canvasCtxRef.current = ctx!;
        }
    }, [canvasRef.current]);

    useEffect(() => {
        if (canvasCtx) {
            console.log(canvasCtx);
            drawElements(canvasCtx, elements);
        }
    }, [canvasCtx]);

    const handleWheelEvent = (e: WheelEvent) => {
        if (e.deltaY < 0 && e.ctrlKey && e.altKey) {
            setState((prev) => ({ ...prev, scale: prev.scale - 0.1 }));
        }
        if (e.deltaY > 0 && e.ctrlKey && e.altKey) {
            setState((prev) => ({ ...prev, scale: prev.scale + 0.1 }));
        }

        if (e.deltaY > 0 && e.shiftKey) {
            setState((prev) => ({
                ...prev,
                translate: { ...prev.translate, y: prev.translate.y + 10 },
            }));
        }
        if (e.deltaY < 0 && e.shiftKey) {
            setState((prev) => ({
                ...prev,
                translate: { ...prev.translate, y: prev.translate.y - 10 },
            }));
        }

        if (e.deltaX < 0 && e.shiftKey) {
            setState((prev) => ({
                ...prev,
                translate: { ...prev.translate, x: prev.translate.x - 10 },
            }));
        }

        if (e.deltaX > 0 && e.shiftKey) {
            setState((prev) => ({
                ...prev,
                translate: { ...prev.translate, x: prev.translate.x + 10 },
            }));
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        console.log(e);
    };

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.addEventListener('wheel', handleWheelEvent);
            canvasRef.current.addEventListener('mousedown', handleMouseDown);
        }
        return () => {
            if (canvasRef.current) {
                canvasRef.current.removeEventListener(
                    'wheel',
                    handleWheelEvent
                );
                canvasRef.current.removeEventListener(
                    'mousedown',
                    handleMouseDown
                );
            }
        };
    }, [canvasRef.current]);

    useEffect(() => {
        if (canvasCtxRef.current && canvasRef.current) {
            canvasRef.current.style.width =
                typeof state.width == 'string'
                    ? state.width
                    : state.width + 'px';
            canvasRef.current.style.height =
                typeof state.height == 'string'
                    ? state.height
                    : state.height + 'px';
            canvasRef.current.width =
                typeof state.width == 'number' ? state.width : 0;
            canvasRef.current.height =
                typeof state.height == 'number' ? state.height : 0;
            canvasCtxRef.current.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            canvasCtxRef.current.scale(state.scale, state.scale);
            canvasCtxRef.current.translate(
                state.translate.x,
                state.translate.y
            );
            drawElements(canvasCtxRef.current, elements);
        }
    }, [state, canvasCtxRef.current, canvasRef.current]);

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', height: '100%', width: '100%' }}
        >
            {zoomControl && (
                <ZoomControl
                    className="absolute bottom-5 left-5 z-50"
                    value={Math.floor(state.scale * 100)}
                    onDecrement={() =>
                        setState((prev) => ({
                            ...prev,
                            scale: prev.scale - 0.1 <= 0 ? 0 : prev.scale - 0.1,
                        }))
                    }
                    onIncrement={() =>
                        setState((prev) => ({
                            ...prev,
                            scale: prev.scale + 0.1,
                        }))
                    }
                    onReset={() => setState((prev) => ({ ...prev, scale: 1 }))}
                />
            )}
            <ShapeSelect
                className="absolute top-5 left-5 z-50"
                shapes={shapes}
                onShapeClick={(shape) => {
                    setShapes((prev) => {
                        return prev.map((sh) => {
                            if (sh.label == shape.label) {
                                return { ...sh, selected: !sh.selected };
                            } else {
                                return sh;
                            }
                        });
                    });
                }}
            />
            <p className="absolute bottom-5 right-5 z-50">Editor..</p>
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default Editor;
