import React from 'react';

export function PhotoStrip({ photos, activeFrame, onPhotoClick }) {
    if (photos.length === 0) return null;

    const isGrid = activeFrame.id === 'grid';
    const isPolaroid = activeFrame.id === 'polaroid';

    return (
        <div
            onClick={() => onPhotoClick(photos)}
            className={`
        fixed right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 p-4 bg-white shadow-2xl 
        cursor-pointer hover:scale-105 transition-all duration-300 origin-right
        ${isPolaroid ? 'rotate-[-2deg] hover:rotate-0' : 'rotate-1 hover:rotate-0'}
      `}
        >
            <div className={`
        ${isGrid ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}
        ${isPolaroid ? 'pb-12' : ''}
      `}>
                {photos.map((photo, index) => (
                    <div key={index} className="w-32 aspect-[4/3] bg-black overflow-hidden border border-gray-200">
                        <img src={photo} alt={`Capture ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>

            {/* Footer / Logo */}
            <div className="text-center font-serif text-black text-xs font-bold uppercase tracking-widest mt-2">
                {isPolaroid ? 'Memories' : 'Photobooth \u2022 No. 88'}
            </div>
        </div>
    );
}
