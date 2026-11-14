/**
 * NASA-FLAME: Scientific Empty & Loading State Indicators
 */

import React from "react";
import { FLAME_THEME } from "../../theme/colors.ts";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  height?: number | string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Combustion Data Available",
  message = "Execute a simulation run or select a NASA experiment record from the library to populate telemetry and visualizations.",
  actionText,
  onAction,
  height = 240,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        backgroundColor: FLAME_THEME.colors.secondary,
        borderRadius: FLAME_THEME.borders.radiusMd,
        border: `1px dashed ${FLAME_THEME.colors.border}`,
        padding: "24px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "rgba(8, 124, 255, 0.1)",
          border: `1px solid ${FLAME_THEME.colors.electricBlueBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
          color: FLAME_THEME.colors.electricBlue,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h4
        style={{
          margin: "0 0 6px 0",
          color: FLAME_THEME.colors.textPrimary,
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: FLAME_THEME.typography.fontFamily,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: "0 0 16px 0",
          color: FLAME_THEME.colors.textMuted,
          fontSize: "12px",
          maxWidth: "380px",
          lineHeight: 1.5,
          fontFamily: FLAME_THEME.typography.fontFamily,
        }}
      >
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "6px 14px",
            backgroundColor: FLAME_THEME.colors.electricBlue,
            color: "#FFFFFF",
            border: "none",
            borderRadius: FLAME_THEME.borders.radiusSm,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = FLAME_THEME.colors.electricBlueHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = FLAME_THEME.colors.electricBlue)}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
