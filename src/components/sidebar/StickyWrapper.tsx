import React, { useEffect, useRef, useState } from 'react';
import '../../styles/Sidebar.css';

interface StickyWrapperProps {
    children: React.ReactNode;
}

const StickyWrapper: React.FC<StickyWrapperProps> = ({ children }) => {
    const [topOffset, setTopOffset] = useState(0);

    useEffect(() => {
        setTopOffset(100);
    }, []);

    return (
        <div
            className="sticky"
            style={{ top: `${topOffset}px` }}
        >
            {children}
        </div>
    );
};

export default StickyWrapper;