'use client';

import { useEffect, useState } from 'react';
import ShapeSelect from 'ui/ShapeSelect';
import ZoomControl from 'ui/ZoomControl';
import EditPanel from 'ui/EditPanel';
import RectIcon from 'ui/Icons/RectIcon';
import ArrowIcon from 'ui/Icons/ArrowIcon';
import CircleIcon from 'ui/Icons/CircleIcon';
import {
    CircleOptions,
    Element as EditorElement,
    RectOptions,
} from './elements';
import { useEditor } from './hooks';
import { getRelativeMousePosition } from './utils';

type EditorProps = {
    initialElements?: EditorElement[];
    zoomControl?: boolean;
};

const Editor = ({ zoomControl, initialElements }: EditorProps) => {
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
    const [editPanelOpen, setEditPanelOpen] = useState(false);
    const {
        state,
        contextRef,
        containerRef,
        canvasRef,
        zoomIn,
        zoomOut,
        zoomReset,
        translate,
        setSelectedShape,
        setPressPosition,
        refresh,
        clearCanvas,
        addEdge,
        addNode,
        moveCurrSelection,
        removeCurrSelection,
        findNode,
        setSelected,
    } = useEditor();

    const handleWheelEvent = (e: WheelEvent) => {
        if (e.deltaY < 0 && e.ctrlKey && e.altKey) {
            zoomOut();
        }
        if (e.deltaY > 0 && e.ctrlKey && e.altKey) {
            zoomIn();
        }

        if (e.deltaY > 0 && e.shiftKey) {
            translate(0, 10);
        }
        if (e.deltaY < 0 && e.shiftKey) {
            translate(0, -10);
        }

        if (e.deltaX < 0 && e.shiftKey) {
            translate(-10, 0);
        }

        if (e.deltaX > 0 && e.shiftKey) {
            translate(10, 0);
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        setPressPosition(getRelativeMousePosition(state, e));
        const foundElements = findNode(getRelativeMousePosition(state, e));
        const foundIds = foundElements.map((e) => e.id);
        if (foundElements.length > 0) {
            setSelected(foundIds);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const mousePosition = getRelativeMousePosition(state, e);
        if (state.selectedShape && state.selectedShape == 'circle') {
            refresh();
            contextRef.current?.beginPath();
            contextRef.current?.arc(
                mousePosition.x,
                mousePosition.y,
                50,
                0,
                Math.PI * 2
            );
            contextRef.current?.stroke();
            return;
        }

        if (state.selectedShape && state.selectedShape == 'rectangle') {
            refresh();
            const x = mousePosition.x - 100;
            const y = mousePosition.y - 50;
            const w = mousePosition.x + 100 - x;
            const h = mousePosition.y + 50 - y;
            contextRef.current?.rect(x, y, w, h);
            contextRef.current?.stroke();
            return;
        }
        if (state.pressPosition) {
            if (state.selectedShape && state.selectedShape == 'arrow') {
                refresh();
                contextRef.current?.moveTo(
                    state.pressPosition.x,
                    state.pressPosition.y
                );
                contextRef.current?.lineTo(mousePosition.x, mousePosition.y);
                contextRef.current?.stroke();
            }
        }

        if (!state.selectedShape && !state.pressPosition) {
            const foundElement = findNode(mousePosition);
            if (canvasRef.current) {
                if (foundElement.length > 0) {
                    canvasRef.current.style.cursor = 'move';
                } else {
                    canvasRef.current.style.cursor = 'auto';
                }
            }
        }
        if (
            !state.selectedShape &&
            state.pressPosition &&
            state.currSelection
        ) {
            moveCurrSelection(mousePosition);
        }
    };
    const handleMouseUp = (e: MouseEvent) => {
        const mousePosition = getRelativeMousePosition(state, e);
        if (state.selectedShape && state.selectedShape == 'circle') {
            const opt: CircleOptions = {
                cx: mousePosition.x,
                cy: mousePosition.y,
                r: 50,
            };
            addNode('circle', opt);
            setPressPosition(null);
            return;
        }
        if (state.selectedShape && state.selectedShape == 'rectangle') {
            const x = mousePosition.x - 100;
            const y = mousePosition.y - 50;
            const w = mousePosition.x + 100 - x;
            const h = mousePosition.y + 50 - y;
            let opt: RectOptions = {
                x,
                y,
                w,
                h,
            };

            addNode('rectangle', opt);
            setPressPosition(null);
            return;
        }
        if (state.pressing && state.pressPosition) {
            if (state.selectedShape && state.selectedShape == 'arrow') {
                let opt = {
                    x1: state.pressPosition.x,
                    y1: state.pressPosition.y,
                    x2: mousePosition.x,
                    y2: mousePosition.y,
                };
                if (Math.abs(opt.x2 - opt.x1) > 5) {
                    addEdge(opt);
                }
            }
        }

        if (
            state.pressPosition &&
            state.pressPosition &&
            !state.selectedShape
        ) {
        }

        setPressPosition(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (state.currSelection && e.key == 'Delete') {
            removeCurrSelection();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        let canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheelEvent);
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheelEvent);
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [state]);

    console.log('State', state);

    return (
        <div ref={containerRef} className="relative h-full">
            {zoomControl && (
                <ZoomControl
                    className="absolute bottom-5 left-5 z-50"
                    value={Math.floor(state.scale * 100)}
                    onDecrement={() => zoomOut()}
                    onIncrement={() => zoomIn()}
                    onReset={() => zoomReset()}
                    onDelete={() => clearCanvas()}
                />
            )}
            <ShapeSelect
                className="absolute top-5 left-5 z-50"
                shapes={shapes}
                onShapeClick={(shape) => {
                    const selectedShape = shapes.find(
                        (sh) => sh.label == shape.label
                    );
                    if (selectedShape) {
                        if (selectedShape.label == state.selectedShape) {
                            setShapes((prev) =>
                                prev.map((sh) => ({ ...sh, selected: false }))
                            );
                            setSelectedShape(null);
                        } else {
                            setShapes((prev) =>
                                prev.map((sh) => ({
                                    ...sh,
                                    selected:
                                        sh.label == shape.label ? true : false,
                                }))
                            );
                            setSelectedShape(shape);
                        }
                    } else {
                        setShapes((prev) =>
                            prev.map((sh) => ({
                                ...sh,
                                selected: sh.label == shape.label,
                            }))
                        );
                        setSelectedShape(shape);
                    }
                    refresh();
                }}
            />
            <EditPanel
                open={editPanelOpen}
                onVisibilityChange={() => setEditPanelOpen(!editPanelOpen)}
                className="absolute top-5 right-5 z-50"
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
