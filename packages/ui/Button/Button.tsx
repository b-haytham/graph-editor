import * as React from 'react';
export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className='bg-blue-800 p-3  rounded shadow-2xl shadow-black' {...props} />
}
