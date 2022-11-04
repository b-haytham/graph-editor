import { Edge } from './edge';
import { Node } from './node';

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
