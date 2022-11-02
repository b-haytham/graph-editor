import { SVGProps } from 'react';
import clsx from 'clsx';

export default function ArrowForwardIcon({
    className,
    ...rest
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            className={clsx('h-8 w-8 text-gray-700', className)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            {...rest}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
        </svg>
    );
}
