import React, { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, .interactive, input, select, textarea'));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`custom-cursor hidden lg:block ${isHovering ? 'hovering' : ''}`}
      style={{ 
        left: mousePos.x, 
        top: mousePos.y,
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
}
