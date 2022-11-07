'use client';
import clsx from 'clsx';
import React, { HTMLAttributes } from 'react';
import ArrowBackwardIcon from '../Icons/ArrowBackward';
import ArrowForwardIcon from '../Icons/ArrowForward';

export interface EditPanelProps extends HTMLAttributes<HTMLDivElement> {
    open: boolean;
    onVisibilityChange: () => void;
    content?: React.ReactNode;
}

export default function EditPanel({
    open,
    onVisibilityChange,
    content,
    className,
    ...rest
}: EditPanelProps) {
    return (
        <div className={clsx('p2 rounded', className)} {...rest}>
            <div className="flex justify-end drop-shadow-2xl">
                <button
                    onClick={onVisibilityChange}
                    className="p-1 rounded-full bg-white hover:border-gray-50"
                >
                    {open ? <ArrowForwardIcon /> : <ArrowBackwardIcon />}
                </button>
            </div>
            {open && (
                <div
                    className={clsx(
                        'rounded-lg p-1 min-h-[300px] min-w-[300px] bg-white mt-2 drop-shadow-2xl animate-in fade-in',
                        {
                            'flex justify-center align-middle': !content,
                        }
                    )}
                >
                    {!content && (
                        <p className="text-gray-700 font-bold">
                            Select Node to Edit
                        </p>
                    )}

                    {content && <div className="p-2">{content}</div>}
                </div>
            )}
        </div>
    );
}
