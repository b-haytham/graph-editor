import { SELECTION_COLOR } from './constants';
import { drawEdge, Edge } from './edge';
import { ArrowOptions, CircleOptions, RectOptions } from './elements';
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

    // ctx.shadowColor = 'black';
    // ctx.shadowBlur = 5;
    // ctx.shadowOffsetX = 5;
    // ctx.shadowOffsetY = 5
    ctx.strokeStyle = 'rgba(0,0,0,.6)';
    ctx.lineWidth = 2;
    // ctx.lineCap = 'round';
    // ctx.lineJoin = 'round';
    ctx.save();
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
                ctx.save();
                const { x2, x1, y2, y1 } = edge.options;
                ctx.strokeStyle = SELECTION_COLOR;
                const p = new Path2D();
                p.moveTo(x1, y1);
                p.lineTo(x2, y2);
                ctx.stroke(p);
                ctx.restore();
            }
        } else {
            const node = state.nodes.find(
                (n) => n.id == state.currSelection!.id
            );
            if (node && node.type == 'rectangle') {
                ctx.save();
                let opt = node.options as RectOptions;
                ctx.strokeStyle = SELECTION_COLOR;
                ctx.strokeRect(
                    opt.x - 10,
                    opt.y - 10,
                    opt.w + 10 * 2,
                    opt.h + 10 * 2
                );
                ctx.restore();
            } else if (node && node.type == 'circle') {
                ctx.save();
                let opt = node.options as CircleOptions;

                ctx.strokeStyle = SELECTION_COLOR;
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
        x: (e.clientX - targetBounds.x) / state.scale - state.translate.x,
        y: (e.clientY - targetBounds.y) / state.scale - state.translate.y,
    };
};

export const getAbsoluteMousePosition = (state: State, point: Point): Point => {
    return {
        x: (point.x + state.translate.x) * state.scale,
        y: (point.y + state.translate.y) * state.scale,
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

export const IsPointInNodeRange = (
    state: State,
    nodes: Node[],
    point: Point
): Node | null => {
    const { ctx } = createTempCanvas(state);
    let resNode: Node | null = null;
    for (const node of nodes) {
        if (node.type == 'circle') {
            const opt = node.options as CircleOptions;

            const circle = new Path2D();
            circle.arc(opt.cx, opt.cy, opt.r + 5, 0, Math.PI * 2);
            ctx.fill(circle);

            if (ctx.isPointInPath(circle, point.x, point.y)) {
                resNode = node;
                break;
            }
        } else {
            const opt = node.options as RectOptions;
            const rect = new Path2D();
            rect.rect(opt.x - 5, opt.y - 5, opt.w + 10, opt.h + 10);
            ctx.fill(rect);
            if (ctx.isPointInPath(rect, point.x, point.y)) {
                resNode = node;
                break;
            }
        }
    }

    return resNode;
};

export const getLeftNodeHandle = (node: Node): Point => {
    if (node.type == 'rectangle') {
        const opt = node.options as RectOptions;
        return {
            x: opt.x,
            y: opt.y + opt.h / 2,
        };
    } else {
        const opt = node.options as CircleOptions;
        return {
            x: opt.cx - opt.r,
            y: opt.cy,
        };
    }
};

export const getRightNodeHandle = (node: Node): Point => {
    if (node.type == 'rectangle') {
        const opt = node.options as RectOptions;
        return {
            x: opt.x + opt.w,
            y: opt.y + opt.h / 2,
        };
    } else {
        const opt = node.options as CircleOptions;
        return {
            x: opt.cx + opt.r,
            y: opt.cy,
        };
    }
};

export const scaleOptions = (
    options: CircleOptions | RectOptions,
    scale: number
) => {
    if ('x' in options) {
        options.w = options.w * scale;
        options.h = options.h * scale;
    } else {
        options.r = options.r * scale;
    }
};

export const drawCircle = (
    ctx: CanvasRenderingContext2D,
    options: CircleOptions
) => {
    ctx.fillStyle = 'while';
    ctx.beginPath();
    ctx.arc(options.cx, options.cy, 50, 0, Math.PI * 2);
    ctx.stroke();
};

export const drawRectange = (
    ctx: CanvasRenderingContext2D,
    options: RectOptions
) => {};

export const drawArrow = (
    ctx: CanvasRenderingContext2D,
    options: ArrowOptions
) => {};
