import { SVGProps } from 'react';
import clsx from 'clsx';

export default function ArrowBackwardIcon({
    className,
    ...rest
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            className={clsx('h-8 w-8 text-gray-700', className)}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="1"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...rest}
        >
            <path stroke="none" d="M0 0h24v24H0z" />{' '}
            <line x1="5" y1="12" x2="19" y2="12" />{' '}
            <line x1="5" y1="12" x2="9" y2="16" />{' '}
            <line x1="5" y1="12" x2="9" y2="8" />
        </svg>
    );
}
