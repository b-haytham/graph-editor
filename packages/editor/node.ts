import { v4 as uuid } from 'uuid';
import { CircleOptions, RectOptions } from './elements';
import { State } from './state';

export type NodeType = 'circle' | 'rectangle';

export type NodeStyle = {};

export type Node = {
    id: string;
    label: string;
    data: any;
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
        data: {},
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
            opt = node.options as RectOptions;
            ctx.rect(opt.x, opt.y, opt.w, opt.h);
            ctx.stroke();
            break;
        case 'circle':
            opt = node.options as CircleOptions;
            ctx.beginPath();
            ctx.arc(opt.cx, opt.cy, opt.r, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }
};
