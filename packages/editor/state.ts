import { createEdge, Edge } from './edge';
import { createNode, Node } from './node';
import { getLeftNodeHandle, getRightNodeHandle } from './utils';

export type Point = { x: number; y: number };

export type Selection = {
    type: 'node' | 'edge';
    id: string;
    data: Node | Edge;
};

export type ShapeType = 'rectangle' | 'circle' | 'arrow';

export type State = {
    width: string | number;
    height: string | number;
    scale: number;
    translate: {
        x: number;
        y: number;
    };
    pressing: boolean;
    pressPosition?: Point;
    selectedShape?: ShapeType;
    currSelection?: Selection;
    nodes: Node[];
    edges: Edge[];
};

export const DEFAULT_STATE: State = {
    width: '100%',
    height: '100%',
    scale: 1,
    translate: {
        x: 0,
        y: 0,
    },
    pressing: false,
    pressPosition: undefined,
    currSelection: undefined,
    nodes: [],
    edges: [],
};

export const populateDefaultState = () => {
    // node 0
    const node0 = createNode('circle', { cx: 100, cy: 200, r: 50 });
    node0.label = 'Node 0';
    node0.data = JSON.stringify({ data: 'node0' });

    const node1 = createNode('circle', { cx: 725, cy: 200, r: 50 });
    node1.label = 'Node 1';
    node1.data = JSON.stringify({ data: 'node1' });

    const node2 = createNode('rectangle', { x: 637, y: 484, w: 200, h: 100 });
    node2.label = 'Node 2';
    node2.data = JSON.stringify({ data: 'node2' });

    const node3 = createNode('rectangle', { x: 1100, y: 225, w: 200, h: 100 });
    node3.label = 'Node 3';
    node3.data = JSON.stringify({ data: 'node3' });

    const node0RightHangle = getRightNodeHandle(node0);
    const node1LeftHangle = getLeftNodeHandle(node1);
    const edge0 = createEdge({
        x1: node0RightHangle.x,
        y1: node0RightHangle.y,
        x2: node1LeftHangle.x,
        y2: node1LeftHangle.y,
    });
    edge0.label = 'Edge 0';
    edge0.data = JSON.stringify({ data: 'edge0' });
    edge0.from = node0.id;
    edge0.to = node1.id;

    const node2LeftHandle = getLeftNodeHandle(node2);
    const edge1 = createEdge({
        x1: node0RightHangle.x,
        y1: node0RightHangle.y,
        x2: node2LeftHandle.x,
        y2: node2LeftHandle.y,
    });
    edge1.label = 'Edge 1';
    edge1.data = JSON.stringify({ data: 'edge1' });
    edge1.from = node0.id;
    edge1.to = node2.id;

    const node1RightHandle = getRightNodeHandle(node1);
    const node3LeftHandle = getLeftNodeHandle(node3);

    const edge2 = createEdge({
        x1: node1RightHandle.x,
        y1: node1RightHandle.y,
        x2: node3LeftHandle.x,
        y2: node3LeftHandle.y,
    });
    edge2.label = 'Edge 2';
    edge2.data = JSON.stringify({ data: 'edge2' });
    edge2.from = node1.id;
    edge2.to = node3.id;

    return {
        nodes: [node0, node1, node2, node3],
        edges: [edge0, edge1, edge2],
    };
};
