import React from 'react';

export function ModalOverlay({ image, onClose, onDownload }) {
    if (!image) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-2xl border-8 border-white bg-white p-2 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img src={image} alt="Enlarged result" className="w-[90vw] md:w-auto md:max-h-[80vh] object-contain mb-4" />

                <div className="flex gap-4 mb-2">
                    <button
                        onClick={onDownload}
                        className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-stone-700 transition shadow-xl"
                    >
                        Download Photo
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-stone-200 text-stone-600 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-stone-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
