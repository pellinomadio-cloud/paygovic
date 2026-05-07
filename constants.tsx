
import React from 'react';
import { Country } from './types';

export const COUNTRIES: Country[] = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'India', code: 'IN' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Japan', code: 'JP' },
];

export const BANKS = [
  { name: 'OPay', code: 'opay' },
  { name: 'PalmPay', code: 'palmpay' },
  { name: 'Access Bank', code: 'access' },
  { name: 'First Bank', code: 'firstbank' },
  { name: 'GTBank', code: 'gtb' },
  { name: 'United Bank for Africa (UBA)', code: 'uba' },
  { name: 'Zenith Bank', code: 'zenith' },
  { name: 'Kuda Bank', code: 'kuda' },
  { name: 'Moniepoint', code: 'moniepoint' },
];

export const PayGoLogo = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-40 h-16 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-950 flex items-center justify-center rounded-lg shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="flex items-center space-x-1">
            <span className="text-white font-bold text-2xl tracking-tighter">PAY</span>
            <div className="relative">
                <span className="text-white font-bold text-2xl tracking-tighter">GO</span>
                <div className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
        </div>
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2">
            <span className="text-[8px] text-gray-300 uppercase tracking-[0.2em] font-medium opacity-70">DIGITAL</span>
        </div>
    </div>
  </div>
);

export const PayGoBanner = () => (
  <div className="w-full max-w-sm h-28 rounded-xl overflow-hidden shadow-md mb-8 relative bg-gradient-to-r from-purple-900 via-purple-700 to-orange-500 flex items-center justify-center">
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    <div className="relative flex flex-col items-center">
      <div className="flex items-baseline">
        <span className="text-white font-bold text-3xl tracking-tighter">PAY</span>
        <span className="text-white font-bold text-3xl tracking-tighter">GO</span>
      </div>
      <span className="text-[7px] text-gray-200 uppercase tracking-[0.4em] font-bold">DIGITAL</span>
    </div>
  </div>
);
