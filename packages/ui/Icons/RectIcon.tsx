import { SVGProps } from "react";

export default function RectIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}
