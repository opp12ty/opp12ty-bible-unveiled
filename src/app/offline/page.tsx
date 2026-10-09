export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <div className="wrap py-16 max-w-xl text-center">
      <h1 className="m-0 text-4xl">You are offline</h1>
      <p className="muted">This page was not saved on your device. Pages you have already opened are still available; search, AI and sync need a connection.</p>
      <a className="neon neon-gold no-underline" href="/">Back to home</a>
    </div>
  );
}
