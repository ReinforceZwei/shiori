export function Item({ id, title, isDraggable = true }: { id: string, title: string, isDraggable?: boolean }) {
  return (
    <div style={{
      padding: "16px",
      background: "white",
      border: `2px solid ${isDraggable ? '#228be6' : '#e0e0e0'}`,
      borderRadius: "8px",
      cursor: isDraggable ? "grab" : "default",
      transition: "all 0.2s ease",
      boxShadow: isDraggable ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.05)",
      opacity: isDraggable ? 1 : 0.6,
    }}>
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "#333",
        marginBottom: "4px",
      }}>
        {title}
      </div>
      <div style={{
        fontSize: "12px",
        color: "#666",
      }}>
        ID: {id}
      </div>
    </div>
  );
}