import React, { useEffect, useState } from 'react';

interface TabTransitionProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const TabTransition: React.FC<TabTransitionProps> = ({ isActive, children }) => {
  const [shouldRender, setShouldRender] = useState(isActive);

  useEffect(() => {
    if (isActive) setShouldRender(true);
  }, [isActive]);

  const onAnimationEnd = () => {
    if (!isActive) setShouldRender(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden min-h-0 ${
        isActive ? 'animate-fade-in' : 'animate-fade-out hidden'
      }`}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};
