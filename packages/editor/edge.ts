import { v4 as uuid } from 'uuid';
import { ArrowOptions } from './elements';

export type EdgeStyle = {};

export type Edge = {
    id: string;
    label: string;
    data: string;
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
        data: '{}' /*{}*/,
        options,
        style: {},
        from: undefined,
        to: undefined,
        selected: false,
    };
    return e;
};

export const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge) => {
    ctx.save();
    ctx.moveTo(edge.options.x1, edge.options.y1);
    ctx.lineTo(edge.options.x2, edge.options.y2);
    ctx.stroke();

    ctx.font = '15px Arial';
    const text = ctx.measureText(edge.label);
    const textX = (edge.options.x2 + edge.options.x1) / 2;
    const textY = (edge.options.y2 + edge.options.y1) / 2;
    // const textX = edge.options.x1;
    // const textY = edge.options.y1;
    //TODO: find better way
    let textBox = {
        x: textX,
        y: textY,
        w: text.actualBoundingBoxRight,
        h: -text.actualBoundingBoxAscent,
    };
    ctx.clearRect(textBox.x, textBox.y, textBox.w, textBox.h);
    ctx.fillText(edge.label, textX, textY);
    ctx.restore();
};
