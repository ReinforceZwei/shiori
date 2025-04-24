'use client';
import CollectionSideNav from "@/lib/component/collection/CollectionSideNav/CollectionSideNav";
import { useEffect, useState } from "react";

export default function CollectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Default width of the left panel
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      e.preventDefault();
      e.stopPropagation();
      const newWidth = e.clientX;
      if (newWidth > 200) { // Minimum width of the left panel
        setLeftPanelWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Attach and detach mouse event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div
        style={{
          width: leftPanelWidth,
          minWidth: 200,
          borderRight: "1px solid #ccc",
          overflow: "auto",
          paddingRight: "16px",
        }}
      >
        <CollectionSideNav />
      </div>
      <div
        style={{
          width: "1px",
          cursor: "col-resize",
          backgroundColor: "#ddd",
          position: "relative",
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-5px", // Extend the draggable area
            right: "-5px",
            bottom: 0,
            cursor: "col-resize",
          }}
        ></div>
      </div>
      <div style={{ flex: 1, overflow: "auto", paddingLeft: "16px", }}>{children}</div>
    </div>
  );
}