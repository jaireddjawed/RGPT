import { ReactNode } from 'react';

type ButtonProps = {
  type: 'primary' | 'secondary' | 'success' | 'info';
  children: ReactNode;
  onClick: () => void;
}

export default function Button({ type, children, onClick }: ButtonProps) {
  if (type === 'primary') {
    return (
      <button
        onClick={onClick}
        className="text-center w-full text-gray-50 bg-blue-600 hover:bg-blue-700 mt-2 mb-2 p-2"
      >
        {children}
      </button>
    )
  }

  else if (type === 'secondary') {
    return (
      <button
        onClick={onClick}
        className="text-center w-full text-gray-50 bg-gray-600 hover:bg-gray-700 mt-2 mb-2 p-2"
      >
        {children}
      </button>
    )
  }

  else if (type === 'success') {
    return (
      <button
        onClick={onClick}
        className="text-center w-full text-gray-50 bg-green-600 hover:bg-green-700 mt-2 mb-2 p-2"
      >
        {children}
      </button>
    )
  }

  return null
}
