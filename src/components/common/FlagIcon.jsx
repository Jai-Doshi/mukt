import React from "react";

/**
 * High-definition vector flag icons for supported currencies.
 * Bypasses Windows OS emoji limitations where flag emojis render as plain text 'IN', 'CA', etc.
 */
export function FlagIcon({ code = "INR", size = 16, style = {}, className = "" }) {
  const cur = (code || "").toUpperCase();
  const width = size;
  const height = Math.round((size * 3) / 4);

  const baseStyle = {
    borderRadius: "2.5px",
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.15)",
    display: "inline-block",
    verticalAlign: "middle",
    flexShrink: 0,
    ...style,
  };

  switch (cur) {
    case "INR":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="India flag"
        >
          {/* Saffron, White, Green stripes */}
          <rect width="24" height="6" fill="#FF9933" />
          <rect y="6" width="24" height="6" fill="#FFFFFF" />
          <rect y="12" width="24" height="6" fill="#138808" />
          {/* Navy Blue Ashoka Chakra */}
          <circle cx="12" cy="9" r="2.2" fill="none" stroke="#000088" strokeWidth="0.55" />
          <circle cx="12" cy="9" r="0.6" fill="#000088" />
          {/* Spokes */}
          <line x1="12" y1="6.8" x2="12" y2="11.2" stroke="#000088" strokeWidth="0.38" />
          <line x1="9.8" y1="9" x2="14.2" y2="9" stroke="#000088" strokeWidth="0.38" />
          <line x1="10.45" y1="7.45" x2="13.55" y2="10.55" stroke="#000088" strokeWidth="0.38" />
          <line x1="10.45" y1="10.55" x2="13.55" y2="7.45" stroke="#000088" strokeWidth="0.38" />
        </svg>
      );

    case "CAD":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="Canada flag"
        >
          {/* Red side bands, White center */}
          <rect width="6" height="18" fill="#D80027" />
          <rect x="6" width="12" height="18" fill="#FFFFFF" />
          <rect x="18" width="6" height="18" fill="#D80027" />
          {/* Iconic Canadian Maple Leaf */}
          <path
            d="M12 3.8 L12.6 6 L14.6 5.5 L13.9 7.1 L16 8 L14.3 9.4 L15 11.3 L12.8 10.4 L12.3 12.6 L12.3 14.3 L11.7 14.3 L11.7 12.6 L11.2 10.4 L9 11.3 L9.7 9.4 L8 8 L10.1 7.1 L9.4 5.5 L11.4 6 Z"
            fill="#D80027"
          />
        </svg>
      );

    case "USD":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="United States flag"
        >
          {/* 7 Stripes */}
          <rect width="24" height="2.57" fill="#B22234" />
          <rect y="2.57" width="24" height="2.57" fill="#FFFFFF" />
          <rect y="5.14" width="24" height="2.57" fill="#B22234" />
          <rect y="7.71" width="24" height="2.57" fill="#FFFFFF" />
          <rect y="10.28" width="24" height="2.57" fill="#B22234" />
          <rect y="12.85" width="24" height="2.57" fill="#FFFFFF" />
          <rect y="15.42" width="24" height="2.58" fill="#B22234" />
          {/* Blue Canton */}
          <rect width="10" height="9.5" fill="#3C3B6E" />
          {/* Stars */}
          <circle cx="2.5" cy="2.5" r="0.8" fill="#FFFFFF" />
          <circle cx="5" cy="2.5" r="0.8" fill="#FFFFFF" />
          <circle cx="7.5" cy="2.5" r="0.8" fill="#FFFFFF" />
          <circle cx="3.75" cy="4.75" r="0.8" fill="#FFFFFF" />
          <circle cx="6.25" cy="4.75" r="0.8" fill="#FFFFFF" />
          <circle cx="2.5" cy="7" r="0.8" fill="#FFFFFF" />
          <circle cx="5" cy="7" r="0.8" fill="#FFFFFF" />
          <circle cx="7.5" cy="7" r="0.8" fill="#FFFFFF" />
        </svg>
      );

    case "GBP":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="United Kingdom flag"
        >
          <rect width="24" height="18" fill="#012169" />
          {/* White diagonals */}
          <line x1="0" y1="0" x2="24" y2="18" stroke="#FFFFFF" strokeWidth="3" />
          <line x1="0" y1="18" x2="24" y2="0" stroke="#FFFFFF" strokeWidth="3" />
          {/* Red diagonals */}
          <line x1="0" y1="0" x2="24" y2="18" stroke="#C8102E" strokeWidth="1.5" />
          <line x1="0" y1="18" x2="24" y2="0" stroke="#C8102E" strokeWidth="1.5" />
          {/* White cross */}
          <rect x="9.5" width="5" height="18" fill="#FFFFFF" />
          <rect y="6.5" width="24" height="5" fill="#FFFFFF" />
          {/* Red cross */}
          <rect x="10.5" width="3" height="18" fill="#C8102E" />
          <rect y="7.5" width="24" height="3" fill="#C8102E" />
        </svg>
      );

    case "EUR":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="European Union flag"
        >
          <rect width="24" height="18" fill="#003399" />
          {/* Circle of stars */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 12 + 5.5 * Math.sin(rad);
            const cy = 9 - 5.5 * Math.cos(rad);
            return <circle key={deg} cx={cx} cy={cy} r="0.75" fill="#FFCC00" />;
          })}
        </svg>
      );

    case "AUD":
    case "NZD":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="Australia flag"
        >
          <rect width="24" height="18" fill="#00008B" />
          {/* Union Jack canton */}
          <rect width="11" height="8.5" fill="#012169" />
          <line x1="0" y1="0" x2="11" y2="8.5" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="0" y1="8.5" x2="11" y2="0" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="11" y2="8.5" stroke="#C8102E" strokeWidth="0.8" />
          <line x1="0" y1="8.5" x2="11" y2="0" stroke="#C8102E" strokeWidth="0.8" />
          <rect x="4.5" width="2" height="8.5" fill="#FFFFFF" />
          <rect y="3.25" width="11" height="2" fill="#FFFFFF" />
          <rect x="5" width="1" height="8.5" fill="#C8102E" />
          <rect y="3.75" width="11" height="1" fill="#C8102E" />
          {/* Southern cross stars */}
          <circle cx="17.5" cy="4" r="0.7" fill="#FFFFFF" />
          <circle cx="15.5" cy="7" r="0.7" fill="#FFFFFF" />
          <circle cx="19.5" cy="7" r="0.7" fill="#FFFFFF" />
          <circle cx="17.5" cy="11" r="0.7" fill="#FFFFFF" />
          <circle cx="18.5" cy="8.5" r="0.5" fill="#FFFFFF" />
        </svg>
      );

    case "JPY":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="Japan flag"
        >
          <rect width="24" height="18" fill="#FFFFFF" />
          <circle cx="12" cy="9" r="4.5" fill="#BC002D" />
        </svg>
      );

    case "AED":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 18"
          className={className}
          style={baseStyle}
          role="img"
          aria-label="UAE flag"
        >
          <rect width="24" height="6" fill="#00732F" />
          <rect y="6" width="24" height="6" fill="#FFFFFF" />
          <rect y="12" width="24" height="6" fill="#000000" />
          <rect width="6" height="18" fill="#FF0000" />
        </svg>
      );

    default:
      return (
        <span
          style={{
            ...baseStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "0.5625rem",
            fontWeight: 800,
            letterSpacing: "-0.05em",
          }}
        >
          {cur.slice(0, 2)}
        </span>
      );
  }
}
