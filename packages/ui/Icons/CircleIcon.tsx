import { SVGProps } from 'react';

export default function CircleIcon({
    className,
    ...rest
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            className={`h-8 w-8 text-gray-700 ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
}
