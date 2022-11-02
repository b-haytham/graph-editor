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

export const getRelativeMousePosition = (state: State, point: Point): Point => {
    return {
        x: point.x - state.translate.x,
        y: point.y - state.translate.y,
    };
};
