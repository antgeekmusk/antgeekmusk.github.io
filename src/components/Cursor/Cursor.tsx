import React, { useState, useEffect } from 'react';

const Cursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(22, 119, 255, 0.6)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                transition: 'width 0.2s, height 0.2s',
                zIndex: 9999

            }}
        />
    );
};

export default Cursor;