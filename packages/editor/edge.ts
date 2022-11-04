import { v4 as uuid } from 'uuid';
import { ArrowOptions } from './elements';

export type EdgeStyle = {};

export type Edge = {
    id: string;
    label: string;
    data: any;
    options: ArrowOptions;
    style: EdgeStyle;
    from?: string;
    to?: string;
    selected: boolean;
};

export const createEdge = (options: ArrowOptions): Edge => {
    const e: Edge = {
        id: uuid(),
        label: '',
        data: {},
        options,
        style: {},
        from: undefined,
        to: undefined,
        selected: false,
    };
    return e;
};

export const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge) => {
    ctx.moveTo(edge.options.x1, edge.options.y1);
    ctx.lineTo(edge.options.x2, edge.options.y2);
    ctx.stroke();
};
