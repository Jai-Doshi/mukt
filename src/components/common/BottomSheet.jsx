import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { triggerHaptic } from "../../utils/haptics";

export function BottomSheet({
  isOpen = true,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "520px",
  showGrabHandle = true,
}) {
  const isMobile = useIsMobile(768);
  const sheetRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Touch event handlers for swipe down to dismiss
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isMobile) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
    setIsDragging(false);
    if (dragY > 110) {
      triggerHaptic("medium");
      onClose?.();
    } else {
      setDragY(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "20px",
        overflow: "hidden",
      }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : maxWidth,
          maxHeight: isMobile ? "92vh" : "88vh",
          backgroundColor: "var(--bg-card-solid)",
          border: isMobile
            ? "1px solid var(--border-card)"
            : "1px solid var(--border-strong)",
          borderBottom: isMobile ? "none" : undefined,
          borderRadius: isMobile ? "24px 24px 0 0" : "var(--radius-lg)",
          boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          transform: isMobile ? `translateY(${dragY}px)` : "none",
          transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
          animation: isMobile
            ? "bottomSheetSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            : "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <style>{`
          @keyframes bottomSheetSlideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Mobile Drag Handle */}
        {isMobile && showGrabHandle && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: "100%",
              padding: "12px 0 6px",
              display: "flex",
              justifyContent: "center",
              cursor: "grab",
              touchAction: "none",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "5px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--border-strong)",
              }}
            />
          </div>
        )}

        {/* Header */}
        {(title || subtitle) && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              padding: isMobile ? "8px 20px 14px" : "20px 24px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border-subtle)",
              flexShrink: 0,
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: isMobile ? "1.15rem" : "1.25rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--text-main)",
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-dim)",
                    marginTop: "2px",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{
                borderRadius: "50%",
                width: "34px",
                height: "34px",
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div
          style={{
            padding: isMobile ? "18px 20px" : "24px",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            flex: 1,
            paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom) + 24px)" : "24px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
