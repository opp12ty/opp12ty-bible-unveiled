import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-16 max-w-xl text-center">
      <h1 className="m-0 text-4xl">Nothing here, yet</h1>
      <p className="muted">That page does not exist, or has moved. Try searching, or take a surprise discovery instead.</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <Link className="neon neon-blue no-underline" href="/search">Search</Link>
        <Link className="neon neon-amber no-underline" href="/surprise">Surprise me</Link>
        <Link className="neon neon-ghost no-underline" href="/">Home</Link>
      </div>
    </div>
  );
}
