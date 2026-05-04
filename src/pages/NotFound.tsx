import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg p-6">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-ink-1">404</h1>
      <p className="mb-4 text-lg text-ink-3">Strona nie istnieje.</p>
      <Link to="/" className="text-accent-600 underline-offset-4 hover:underline">
        Wróć do widoku głównego
      </Link>
    </div>
  </div>
);

export default NotFound;
