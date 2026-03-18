import React from "react";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function Stepper({ mode = "single", step = "context" }) {
  const isBulk = mode === "bulk";
  const steps = isBulk ? ["context", "situation", "generate"] : ["context", "generate"];
  const activeIndex = Math.max(0, steps.indexOf(step));
  const progress = steps.length <= 1 ? 0 : activeIndex / (steps.length - 1);

  const renderNode = (nodeStep, index, positionStyle) => {
    const isCompleted = index < activeIndex;
    const isActive = index === activeIndex;

    const baseStyle = {
      position: "absolute",
      top: "-7px",
      width: "16px",
      height: "16px",
      borderRadius: "999px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...positionStyle,
    };

    if (isCompleted) {
      return (
        <div
          style={{
            ...baseStyle,
            background: "#2563eb",
            border: "1px solid #2563eb",
            color: "#ffffff",
          }}
          aria-label={`${nodeStep} completed`}
        >
          <CheckIcon />
        </div>
      );
    }

    if (isActive) {
      return (
        <div
          style={{
            ...baseStyle,
            background: "#ffffff",
            border: "1px solid #3b82f6",
          }}
          aria-label={`${nodeStep} active`}
        >
          <div style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#3b82f6" }} />
        </div>
      );
    }

    return (
      <div
        style={{
          ...baseStyle,
          background: "#ffffff",
          border: "1px solid #d1d5db",
        }}
        aria-label={`${nodeStep} upcoming`}
      />
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {isBulk ? (
        <>
          <div style={{ position: "relative", width: "100%", maxWidth: "420px", height: "8px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "2px", background: "#e5e7eb", borderRadius: "999px" }} />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "2px",
                background: "#3b82f6",
                borderRadius: "999px",
                width: `${progress * 100}%`,
              }}
            />

            {renderNode("context", 0, { left: 0 })}
            {renderNode("situation", 1, { left: "50%", transform: "translateX(-50%)" })}
            {renderNode("generate", 2, { right: 0 })}
          </div>
          <div style={{ width: "100%", maxWidth: "420px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280" }}>
            <span style={{ transform: "translateX(-6px)" }}>Context</span>
            <span style={{ transform: "translateX(4px)" }}>Situation</span>
            <span style={{ transform: "translateX(10px)" }}>Generate</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "relative", width: "100%", maxWidth: "420px", height: "8px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "2px", background: "#e5e7eb", borderRadius: "999px" }} />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "2px",
                background: "#3b82f6",
                borderRadius: "999px",
                width: `${progress * 100}%`,
              }}
            />

            {renderNode("context", 0, { left: 0 })}
            {renderNode("generate", 1, { right: 0 })}
          </div>
          <div style={{ width: "100%", maxWidth: "420px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#6b7280" }}>
            <span style={{ transform: "translateX(-6px)" }}>Context</span>
            <span style={{ transform: "translateX(10px)" }}>Generate</span>
          </div>
        </>
      )}
    </div>
  );
}
