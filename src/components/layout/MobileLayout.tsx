import React from 'react';
import BottomNav from './BottomNav';

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col bg-gray-900">
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
};

export default MobileLayout;
