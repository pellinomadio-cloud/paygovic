
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <div className="w-full mb-4">
      <input
        {...props}
        className={`w-full h-14 px-6 rounded-2xl border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 ${className}`}
      />
    </div>
  );
};

export default Input;
