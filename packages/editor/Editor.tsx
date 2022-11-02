'use client';

import { useEffect, useState } from 'react';
import ShapeSelect from 'ui/ShapeSelect';
import ZoomControl from 'ui/ZoomControl';
import EditPanel from 'ui/EditPanel';
import RectIcon from 'ui/Icons/RectIcon';
import ArrowIcon from 'ui/Icons/ArrowIcon';
import CircleIcon from 'ui/Icons/CircleIcon';
import { Element as EditorElement } from './elements';
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
        // contextRef,
        containerRef,
        canvasRef,
        zoomIn,
        zoomOut,
        zoomReset,
        translate,
        setSelectedShape,
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
        console.log('Selected Shape ', state.selectedShape);
        console.log('State ', state);
        console.log('Mouse Down ', e);
        console.log(
            getRelativeMousePosition(state, { x: e.clientX, y: e.clientY })
        );
    };

    useEffect(() => {
        let canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheelEvent);
            canvas.addEventListener('mousedown', handleMouseDown);
        }
        return () => {
            if (canvas) {
                canvas.removeEventListener('wheel', handleWheelEvent);
                canvas.removeEventListener('mousedown', handleMouseDown);
            }
        };
    }, [state]);

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', height: '100%', width: '100%' }}
        >
            {zoomControl && (
                <ZoomControl
                    className="absolute bottom-5 left-5 z-50"
                    value={Math.floor(state.scale * 100)}
                    onDecrement={() => zoomOut()}
                    onIncrement={() => zoomIn()}
                    onReset={() => zoomReset()}
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
                    setSelectedShape(shape);
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
