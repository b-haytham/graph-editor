import * as React from 'react';
export type ElementType = "arrow" | "circle" | "rect";

export type ArrowOptions = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export type CircleOptions = {
  cx: number;
  cy: number;
  r: number
};
export type RectOptions = {
  x: number;
  y: number;
  w: number;
  h: number;
}


export type ElementOptions = ArrowOptions | CircleOptions | RectOptions

export type Element = {
  type: ElementType,
  options: ArrowOptions | CircleOptions | RectOptions
}

export const fakeElements: Element[] = [
  {
    type: "circle",
    options: {
      cx: 50,
      cy: 50,
      r: 150
    }
  },
  {
    type: "rect",
    options: {
      x: 60,
      y: 60,
      w: 60,
      h: 60
    }
  }
]


export const drawElements = (ctx: CanvasRenderingContext2D, elements: Element[]) => {
  for (const el of elements) {
    drawElement(ctx, el);
  }
};

const drawElement = (ctx: CanvasRenderingContext2D, element: Element) => {
  let opt: ElementOptions
  switch (element.type) {
    case "circle":
      opt = element.options as CircleOptions;
      ctx.arc(opt.cx, opt.cy, opt.r, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "rect":
      opt = element.options as RectOptions
      ctx.rect(opt.x, opt.y, opt.w, opt.h);
      ctx.stroke();
      break;
  }
}
