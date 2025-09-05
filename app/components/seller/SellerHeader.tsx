import React from 'react';

interface SellerHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

const SellerHeader: React.FC<SellerHeaderProps> = ({ onMenuClick, userName }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 w-full">
      <div className="flex items-center justify-between">
        <button onClick={onMenuClick} className="p-2 text-gray-500 hover:text-gray-700">
          {/* Menu Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-lg font-semibold">{userName}</div>
      </div>
    </header>
  );
};

export default SellerHeader;
