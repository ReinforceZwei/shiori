// This page intentionally throws an error to test the global error boundary.

export default function TestErrorPage() {
  // Simulate a render-time error
  throw new Error("This is a test error for verifying the error page.");

  // In case it gets caught/recovered somehow, show fallback UI
  return <div>Test Error Page</div>;
}
