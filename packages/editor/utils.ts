import { drawEdge, Edge } from './edge';
import { CircleOptions, RectOptions } from './elements';
import { drawNode, Node } from './node';
import { Point, State } from './state';

export const redraw = (
    state: State,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
) => {
    canvas.style.width =
        typeof state.width == 'string' ? state.width : state.width + 'px';
    canvas.style.height =
        typeof state.height == 'string' ? state.height : state.height + 'px';
    canvas.width = typeof state.width == 'number' ? state.width : 0;
    canvas.height = typeof state.height == 'number' ? state.height : 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(state.scale, state.scale);
    ctx.translate(state.translate.x, state.translate.y);

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const node of state.nodes) {
        drawNode(ctx, node);
    }
    for (const edge of state.edges) {
        drawEdge(ctx, edge);
    }

    if (state.currSelection) {
        if (state.currSelection.type == 'edge') {
            const edge = state.edges.find(
                (e) => e.id == state.currSelection!.id
            );
            if (edge) {
                const { x2, x1, y2, y1 } = edge.options;
                ctx.save();
                ctx.strokeStyle = 'cyan';

                // ctx.moveTo(x1 - 4, y1 - 4);
                // ctx.lineTo(x2 + 4, y2 - 4 * 2);
                // ctx.moveTo(x1 - 2.5, y1 - 2.5);
                // ctx.lineTo(x2 - 2.5, y2 - 2.5);
                // ctx.moveTo(x1 + 2.5, y1 + 2.5);
                // ctx.lineTo(x2 + 2.5, y2 + 2.5);
                ctx.stroke();
                ctx.restore();
            }
        } else {
            const node = state.nodes.find(
                (n) => n.id == state.currSelection!.id
            );
            if (node && node.type == 'rectangle') {
                let opt = node.options as RectOptions;
                ctx.save();
                ctx.strokeStyle = 'cyan';
                ctx.strokeRect(
                    opt.x - 10,
                    opt.y - 10,
                    opt.w + 10 * 2,
                    opt.h + 10 * 2
                );
                ctx.restore();
            } else if (node && node.type == 'circle') {
                let opt = node.options as CircleOptions;
                ctx.save();

                ctx.strokeStyle = 'cyan';
                ctx.beginPath();
                ctx.arc(opt.cx, opt.cy, opt.r + 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
};

export const getRelativeMousePosition = (
    state: State,
    e: MouseEvent
): Point => {
    const target = e.target as HTMLElement;
    const targetBounds = target.getBoundingClientRect();
    return {
        x: e.clientX - state.translate.x - targetBounds.x,
        y: e.clientY - state.translate.y - targetBounds.y,
    };
};

export const createTempCanvas = (
    state: State
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.style.width == state.width.toString() + 'px';
    cvs.style.height == state.height.toString() + 'px';
    cvs.width = state.width as number;
    cvs.height = state.height as number;
    ctx?.scale(state.scale, state.scale);
    ctx?.translate(state.translate.x, state.translate.y);
    return {
        canvas: cvs,
        ctx: ctx!,
    };
};
