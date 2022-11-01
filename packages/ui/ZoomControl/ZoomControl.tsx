import { HTMLAttributes } from 'react';
import MinusIcon from '../Icons/MinusIcon';
import PlusIcon from '../Icons/PlusIcon';
import ResetIcon from '../Icons/ResetIcon';

export interface ZoomControlProps extends HTMLAttributes<HTMLDivElement> {
    value: number | string;
    onIncrement?: () => void;
    onDecrement?: () => void;
    onReset?: () => void;
}

export default function ZoomControl({
    value,
    onDecrement,
    onIncrement,
    onReset,
    className,
    ...rest
}: ZoomControlProps) {
    let v = typeof value == 'string' ? value : `${value} %`;
    return (
        <div
            className={`flex rounded bg-white drop-shadow-2xl ${className}`}
            {...rest}
        >
            <button className="p-2 hover:border-gray-50" onClick={onDecrement}>
                <MinusIcon className="h-3 w-3" />
            </button>
            <p className="text-justify align-middle mx-2">{v}</p>
            <button className="p-2" onClick={onIncrement}>
                <PlusIcon className="h-3 w-3" />
            </button>
            <button className="p-2 border-l" onClick={onReset}>
                <ResetIcon className="h-3 w-3" />
            </button>
        </div>
    );
}
