import { drawElements, Element } from './elements';
import { Point, State } from './state';

export const redraw = (
    state: State,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,

    // todo: change elemenst
    elements: Element[]
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
    drawElements(ctx, elements);
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
