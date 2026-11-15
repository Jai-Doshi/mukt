import React, { useState, useRef } from "react";
import { useMukt } from "../../context/MuktContext";
import { formatMoney, formatCompact, monthName } from "../../constants";

export function RepaymentsChart() {
  const { state, calc, getPerson } = useMukt();
  const { chartData } = calc;
  const display = state.settings.display;
  const currency = display === "local" ? state.settings.localCur : state.settings.loanCur;

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  const maxTotal = Math.max(...chartData.map((d) => d.total), 0);

  // Generate nice scale
  const getNiceCeiling = (val) => {
    if (val <= 0) return 10000;
    const pow = Math.pow(10, Math.floor(Math.log10(val)));
    const frac = val / pow;
    const mult = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;
    return mult * pow;
  };

  const topScale = getNiceCeiling(maxTotal);
  const height = 220;
  const paddingBottom = 26;
  const paddingTop = 12;
  const chartHeight = height - paddingBottom - paddingTop;

  const yCoord = (val) =>
    height - paddingBottom - (val / topScale) * chartHeight;

  return (
    <div
      className="glass-card"
      style={{ padding: "24px", position: "relative" }}
      ref={containerRef}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
            Monthly Repayments
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}>
            Last 12 months, stacked by contributor
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {state.people.map((p) => {
            const hasPaid = state.payments.some((pm) => pm.payerId === p.id);
            if (!hasPaid) return null;
            return (
              <div
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: p.color,
                  }}
                />
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {maxTotal === 0 ? (
        <div
          style={{
            height: "180px",
            display: "grid",
            placeItems: "center",
            color: "var(--text-dim)",
            fontSize: "0.875rem",
          }}
        >
          No repayments recorded in the last 12 months
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
          <svg
            viewBox={`0 0 600 ${height}`}
            width="100%"
            height={height}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const val = topScale * pct;
              const y = yCoord(val);
              return (
                <g key={i}>
                  <line
                    x1="45"
                    y1={y}
                    x2="600"
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray={pct === 0 ? "none" : "3,3"}
                  />
                  <text
                    x="40"
                    y={y + 3}
                    textAnchor="end"
                    fill="var(--text-dim)"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    {formatCompact(val, currency)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {chartData.map((d, idx) => {
              const slotWidth = (600 - 50) / 12;
              const barWidth = Math.min(24, slotWidth * 0.6);
              const xCenter = 50 + idx * slotWidth + slotWidth / 2;
              const xLeft = xCenter - barWidth / 2;

              let runningAcc = 0;
              const entries = Object.entries(d.byPerson);
              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={d.month}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Invisible Hit Area */}
                  <rect
                    x={xCenter - slotWidth / 2}
                    y={paddingTop}
                    width={slotWidth}
                    height={chartHeight}
                    fill={isHovered ? "var(--border-subtle)" : "transparent"}
                    rx="4"
                    transition="fill 0.15s ease"
                  />

                  {/* Stacked Bars */}
                  {entries.map(([personId, amount], k) => {
                    const person = getPerson(personId);
                    const y1 = yCoord(runningAcc + amount);
                    const y0 = yCoord(runningAcc);
                    const segmentHeight = Math.max(0, y0 - y1);
                    runningAcc += amount;

                    const isTopSegment = k === entries.length - 1;

                    return (
                      <rect
                        key={personId}
                        x={xLeft}
                        y={y1}
                        width={barWidth}
                        height={segmentHeight}
                        fill={person.color}
                        rx={isTopSegment ? 4 : 0}
                        opacity={isHovered ? 1 : 0.9}
                        style={{
                          transition: "opacity 0.15s ease",
                        }}
                      />
                    );
                  })}

                  {/* Month Label */}
                  <text
                    x={xCenter}
                    y={height - 6}
                    textAnchor="middle"
                    fill={isHovered ? "var(--text-main)" : "var(--text-dim)"}
                    fontSize="11"
                    fontWeight={isHovered ? "700" : "500"}
                  >
                    {new Date(d.month + "-01T00:00:00").toLocaleDateString("en-GB", {
                      month: "short",
                    })}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: `${Math.min(
                  85,
                  Math.max(15, (hoveredIndex / 11) * 100)
                )}%`,
                transform: "translateX(-50%)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                pointerEvents: "none",
                zIndex: 20,
                minWidth: "170px",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  marginBottom: "6px",
                  color: "var(--text-main)",
                  borderBottom: "1px solid var(--border-subtle)",
                  paddingBottom: "4px",
                }}
              >
                {monthName(chartData[hoveredIndex].month)}
              </div>

              {Object.entries(chartData[hoveredIndex].byPerson).length === 0 ? (
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  No repayments made
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {Object.entries(chartData[hoveredIndex].byPerson).map(([pId, amt]) => {
                    const p = getPerson(pId);
                    return (
                      <div
                        key={pId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: p.color,
                            }}
                          />
                          <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
                        </span>
                        <span className="num" style={{ fontWeight: 700 }}>
                          {formatMoney(amt, currency, { round: true })}
                        </span>
                      </div>
                    );
                  })}
                  <div
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "4px",
                      marginTop: "2px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 800,
                      fontSize: "0.8125rem",
                    }}
                  >
                    <span>Total</span>
                    <span className="num" style={{ color: "var(--accent)" }}>
                      {formatMoney(chartData[hoveredIndex].total, currency, { round: true })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
