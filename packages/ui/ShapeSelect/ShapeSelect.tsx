import { HTMLAttributes } from "react";
import clsx from 'clsx';
import type { Shape } from "./types";


export interface ShapeSelectProps extends HTMLAttributes<HTMLDivElement> {
  shapes: Shape[],
  onShapeClick: (shape: Shape) => void;
}

export default function ShapeSelect({ shapes, onShapeClick, className, ...rest }: ShapeSelectProps) {
  return (
    <div className={`flex rounded bg-white drop-shadow-2xl overflow-hidden ${className}`} {...rest} >
      {shapes.map((sh) => (
        <button
          key={sh.label?.toString()}
          onClick={() => onShapeClick(sh)}
          className={clsx("p-2 hover:bg-gray-50", { "bg-gray-50": sh.selected })}
        >
          {sh.icon}
        </button>
      ))}
    </div>
  )
}
