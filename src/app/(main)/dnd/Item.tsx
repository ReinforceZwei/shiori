export function Item({ id, title }: { id: string, title: string }) {
  return (
    <div style={{
      padding: "12px",
      margin: "8px 0",
      background: "white",
      border: "1px solid #ddd",
      borderRadius: 4,
    }}>
      <h1>Item</h1>
      <p>{title}</p>
    </div>
  );
}