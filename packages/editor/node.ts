import { v4 as uuid } from 'uuid';
import { CircleOptions, RectOptions } from './elements';
import { State } from './state';

export type NodeType = 'circle' | 'rectangle';

export type NodeStyle = {};

export type Node = {
    id: string;
    label: string;
    data: string;
    options: CircleOptions | RectOptions;
    type: NodeType;
    style: NodeStyle;
    selected: boolean;
};

export const createNode = (
    type: NodeType,
    options: CircleOptions | RectOptions
): Node => {
    const n: Node = {
        id: uuid(),
        type,
        label: '',
        data: '{}',
        options,
        style: {},
        selected: false,
    };
    return n;
};

export const drawNode = (ctx: CanvasRenderingContext2D, node: Node) => {
    let opt: CircleOptions | RectOptions;
    switch (node.type) {
        case 'rectangle':
            ctx.save();
            opt = node.options as RectOptions;
            ctx.rect(opt.x, opt.y, opt.w, opt.h);
            ctx.stroke();
            ctx.font = '15px Arial';
            ctx.fillText(node.label, opt.x, opt.y - 15);
            ctx.restore();
            break;
        case 'circle':
            ctx.save();
            opt = node.options as CircleOptions;
            ctx.beginPath();
            ctx.arc(opt.cx, opt.cy, opt.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = '15px Arial';
            const text = ctx.measureText(node.label);
            ctx.fillText(
                node.label,
                opt.cx - text.width / 2,
                opt.cy - opt.r - 15
            );
            ctx.restore();
            break;
    }
};
