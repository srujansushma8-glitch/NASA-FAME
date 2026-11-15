/**
 * NASA-FLAME: Scientific Out-of-Bounds & Error State Display
 */

import React from "react";
import { FLAME_THEME } from "../../theme/colors";

export interface ErrorStateProps {
  errorTitle?: string;
  errorMessage: string;
  errorCode?: string;
  onRetry?: () => void;
  height?: number | string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  errorTitle = "Combustion Simulation Telemetry Error",
  errorMessage,
  errorCode = "ERR_DATA_INVALID",
  onRetry,
  height = 200,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        borderRadius: FLAME_THEME.borders.radiusMd,
        border: `1px solid rgba(239, 68, 68, 0.3)`,
        padding: "20px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: `1px solid rgba(239, 68, 68, 0.4)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "10px",
          color: FLAME_THEME.colors.danger,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <h4
          style={{
            margin: 0,
            color: FLAME_THEME.colors.danger,
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: FLAME_THEME.typography.fontFamilyMono,
          }}
        >
          {errorTitle}
        </h4>
        <span
          style={{
            fontSize: "10px",
            padding: "1px 6px",
            borderRadius: "3px",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            color: FLAME_THEME.colors.danger,
            fontFamily: FLAME_THEME.typography.fontFamilyMono,
          }}
        >
          {errorCode}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 12px 0",
          color: FLAME_THEME.colors.textMuted,
          fontSize: "12px",
          maxWidth: "420px",
          lineHeight: 1.4,
          fontFamily: FLAME_THEME.typography.fontFamily,
        }}
      >
        {errorMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "5px 12px",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            color: "#FCA5A5",
            border: `1px solid rgba(239, 68, 68, 0.4)`,
            borderRadius: FLAME_THEME.borders.radiusSm,
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Retry Data Fetch
        </button>
      )}
    </div>
  );
};
