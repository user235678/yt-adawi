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
        </button>
        <div className="text-lg font-semibold">{userName}</div>
      </div>
    </header>
  );
};

export default SellerHeader;
