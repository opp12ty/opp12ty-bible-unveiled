"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap py-16 max-w-xl text-center">
      <h1 className="m-0 text-4xl">Something went wrong</h1>
      <p className="muted">An unexpected problem stopped this page from loading. It is not caused by anything you did.</p>
      <button className="neon neon-gold" onClick={reset}>Try again</button>
    </div>
  );
}
