import React, { useRef } from 'react';

const MagneticButton = ({ children, onClick, styleClass = "magnetic-btn-primary" }) => {
    const btnRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        btnRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseLeave = () => {
        if (!btnRef.current) return;
        btnRef.current.style.transform = `translate(0px, 0px) scale(1)`;
    };

    return (
        <button
            ref={btnRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => {
                if (e.currentTarget) e.currentTarget.style.transform += ' scale(0.95)';
            }}
            onMouseUp={handleMouseLeave}
            className={styleClass}
        >
            {children}
        </button>
    );
};

export default MagneticButton;
