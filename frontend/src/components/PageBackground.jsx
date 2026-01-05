import React from 'react';

const PageBackground = ({ variant = 'default' }) => {
    // Common styles for all icons/elements
    const baseStyle = "absolute text-slate-300 dark:text-slate-700 pointer-events-none select-none z-0";

    // Animation constants
    const floatSlow = "animate-float-slow";
    const floatMedium = "animate-float-medium";
    const floatFast = "animate-float-fast";
    const pulseSlow = "animate-pulse-slow";

    const renderVariant = () => {
        switch (variant) {
            case 'battle': // The Arena
                return (
                    <>
                        {/* Swords Cross */}
                        <div className={`${baseStyle} top-20 left-10 opacity-10 dark:opacity-20 w-64 h-64 ${floatSlow}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14.5 17.5L3 6V3h3l11.5 11.5-3 3zM6.5 9.5L18 21h3v-3L9.5 6.5l-3 3z" />
                            </svg>
                        </div>
                        {/* Shield */}
                        <div className={`${baseStyle} bottom-20 right-20 opacity-10 dark:opacity-20 w-96 h-96 ${floatMedium}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                        </div>
                        {/* Sparkles/Clash */}
                        <div className={`${baseStyle} top-1/2 left-1/2 opacity-20 dark:opacity-30 w-32 h-32 ${pulseSlow}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14 10H22L16 14.5L18 22L12 17L6 22L8 14.5L2 10H10L12 2Z" />
                            </svg>
                        </div>
                    </>
                );

            case 'analysis': // Document Analysis
                return (
                    <>
                        {/* Document Icon */}
                        <div className={`${baseStyle} top-32 right-32 opacity-10 dark:opacity-20 w-80 h-80 ${floatSlow}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        {/* Magnifying Glass */}
                        <div className={`${baseStyle} bottom-10 left-20 opacity-10 dark:opacity-20 w-64 h-64 ${floatMedium} rotate-12`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </div>
                    </>
                );

            case 'compare': // Comparison
                return (
                    <>
                        {/* Balance Scale */}
                        <div className={`${baseStyle} top-10 right-1/4 opacity-10 dark:opacity-20 w-72 h-72 ${floatSlow}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L1 21h22L12 2zm0 3.5L18.5 19H5.5L12 5.5z" />
                            </svg>
                        </div>
                        {/* Arrows Exchange */}
                        <div className={`${baseStyle} bottom-32 left-32 opacity-10 dark:opacity-20 w-56 h-56 ${floatMedium}`}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                            </svg>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gradient Blobs (Common) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob 
                    ${variant === 'battle' ? 'bg-indigo-300 dark:bg-indigo-900' :
                        variant === 'compare' ? 'bg-teal-300 dark:bg-teal-900' :
                            'bg-blue-300 dark:bg-blue-900'}`}>
                </div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000
                    ${variant === 'battle' ? 'bg-purple-300 dark:bg-purple-900' :
                        variant === 'compare' ? 'bg-teal-300 dark:bg-teal-900' :
                            'bg-emerald-300 dark:bg-emerald-900'}`}>
                </div>
            </div>

            {/* Icon Layer */}
            {renderVariant()}
        </div>
    );
};

export default PageBackground;
