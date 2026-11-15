import React from "react";
import { initials } from "../../constants";

export function Avatar({ person, size = "md", className = "" }) {
  const name = person?.name || "Person";
  const color = person?.color || "#10b981";

  const sizeStyles = {
    sm: { width: "28px", height: "28px", fontSize: "11px" },
    md: { width: "38px", height: "38px", fontSize: "13px" },
    lg: { width: "48px", height: "48px", fontSize: "16px" },
    xl: { width: "64px", height: "64px", fontSize: "20px" },
  };

  const style = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`avatar-circle ${className}`}
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        fontWeight: "700",
        flexShrink: 0,
        backgroundColor: `color-mix(in srgb, ${color} 18%, var(--bg-card-solid))`,
        color: color,
        border: `1.5px solid color-mix(in srgb, ${color} 35%, transparent)`,
        boxShadow: `0 2px 8px color-mix(in srgb, ${color} 20%, transparent)`,
        userSelect: "none",
      }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
