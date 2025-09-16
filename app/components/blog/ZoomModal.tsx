import React from "react";
import { useEffect } from "react";

interface ZoomModalProps {
  zoomedImage: string;
  zoomScale: number;
  zoomPosition: { x: number; y: number };
  isDragging: boolean;
  showControls: boolean;
  onClose: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onToggleControls: () => void;
}

export default function ZoomModal({
  zoomedImage,
  zoomScale,
  zoomPosition,
  isDragging,
  showControls,
  onClose,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onToggleControls,
}: ZoomModalProps) {
  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomScale > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - zoomPosition.x,
        y: touch.clientY - zoomPosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoomScale > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setZoomPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Overlay pour fermer */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Contrôles */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomOut();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
            title="Zoom arrière (- ou molette)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomReset();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
            title="Réinitialiser le zoom (0)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoomIn();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
            title="Zoom avant (+ ou molette)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
            title="Fermer (Échap)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Bouton pour masquer/afficher les contrôles */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleControls();
        }}
        className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-all duration-200"
        title="Masquer/Afficher les contrôles"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      </button>

      {/* Indicateur de zoom */}
      {showControls && (
        <div className="absolute bottom-4 left-4 z-10 bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm">
          {Math.round(zoomScale * 100)}%
        </div>
      )}

      {/* Image zoomable */}
      <div className="relative max-w-full max-h-full overflow-hidden">
        <img
          src={zoomedImage}
          alt="Image agrandie"
          className={`max-w-none max-h-none object-contain transition-transform duration-200 select-none ${
            isDragging ? 'cursor-grabbing' : zoomScale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `scale(${zoomScale}) translate(${zoomPosition.x / zoomScale}px, ${zoomPosition.y / zoomScale}px)`,
            transformOrigin: 'center',
            touchAction: 'none'
          }}
          draggable="false"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Instructions */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10 bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs">
          {zoomScale > 1 ? "Glisser pour déplacer" : "Molette ou +/- pour zoomer"}
        </div>
      )}
    </div>
  );
}
