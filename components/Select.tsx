
import React from 'react';
import { Country } from '../types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Country[];
}

const Select: React.FC<SelectProps> = ({ options, className = '', ...props }) => {
  return (
    <div className="w-full mb-4 relative">
      <select
        {...props}
        className={`w-full h-14 px-6 pr-12 rounded-2xl border border-gray-200 text-gray-700 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${className}`}
      >
        <option value="" disabled hidden>Select Country</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <i className="fas fa-chevron-down text-xs"></i>
      </div>
    </div>
  );
};

export default Select;
