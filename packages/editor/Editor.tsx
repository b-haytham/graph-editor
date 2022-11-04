'use client';

import { ChangeEvent, useEffect, useState } from 'react';
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
import {
    getLeftNodeHandle,
    getRelativeMousePosition,
    getRightNodeHandle,
    IsPointInNodeRange,
} from './utils';
import { createEdge } from './edge';
import { createNode } from './node';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

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
        setEdgeLabel,
        setNodeLabel,
        setEdgeData,
        setNodeData,
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
            addNode(createNode('circle', opt));
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

            addNode(createNode('rectangle', opt));
            setPressPosition(null);
            return;
        }
        if (state.pressing && state.pressPosition) {
            if (state.selectedShape && state.selectedShape == 'arrow') {
                let from = IsPointInNodeRange(
                    state,
                    state.nodes,
                    state.pressPosition
                );
                let to = IsPointInNodeRange(state, state.nodes, mousePosition);
                if (from && to && from.id !== to.id) {
                    console.log({ from, to });
                    const fromHandlePoint = getRightNodeHandle(from);
                    const toHandlePoint = getLeftNodeHandle(to);
                    let opt = {
                        x1: fromHandlePoint.x,
                        y1: fromHandlePoint.y,
                        x2: toHandlePoint.x,
                        y2: toHandlePoint.y,
                    };
                    const edge = createEdge(opt);
                    edge.from = from.id;
                    edge.to = to.id;
                    addEdge(edge);
                    setSelectedShape(null);
                }
                // } else {
                //     let opt = {
                //         x1: state.pressPosition.x,
                //         y1: state.pressPosition.y,
                //         x2: mousePosition.x,
                //         y2: mousePosition.y,
                //     };
                //     if (Math.abs(opt.x2 - opt.x1) > 5) {
                //         addEdge(createEdge(opt));
                //     }
                // }
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

    const handleJsonDataChange = (value: string) => {
        if (state.currSelection!.type == 'edge') {
            setEdgeData(state.currSelection!.id, value);
        } else {
            setNodeData(state.currSelection!.id, value);
        }
    };
    const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (state.currSelection!.type == 'edge') {
            setEdgeLabel(state.currSelection!.id, e.target.value);
        } else {
            setNodeLabel(state.currSelection!.id, e.target.value);
        }
    };

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
                content={
                    state.currSelection && (
                        <div>
                            <div className="mb-3">
                                <label
                                    htmlFor="label"
                                    className="block mb-2 text-md font-bold text-gray-900"
                                >
                                    Label
                                </label>
                                <input
                                    type="text"
                                    id="label"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="Label"
                                    value={state.currSelection.data.label}
                                    onChange={handleLabelChange}
                                    required
                                />
                            </div>
                            <div className="mt-3">
                                <label
                                    htmlFor="message"
                                    className="block mb-2 text-md font-bold text-gray-900"
                                >
                                    Json Data
                                </label>
                                <AceEditor
                                    mode={'json'}
                                    theme="tomorrow"
                                    fontSize={14}
                                    value={state.currSelection.data.data}
                                    onChange={handleJsonDataChange}
                                    style={{ borderRadius: 10 }}
                                    setOptions={{
                                        tabSize: 4,
                                        useWorker: false,
                                    }}
                                />
                            </div>
                        </div>
                    )
                }
            />
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default Editor;
