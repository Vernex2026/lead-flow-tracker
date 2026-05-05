import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "yl_gate_token_v1";
const SESSION_HOURS = 24;

// SHA-256 hash of "Vernex123!@#". Wbudowane jako fallback żeby gate
// działał out-of-the-box (Lovable preview, Vercel bez env var, etc.).
// Możesz nadpisać dla innego hasła per environment przez VITE_APP_PASSWORD_HASH.
const FALLBACK_HASH = "161412538c1bc2b627cedc3e579a30fcc709bf783ed285e36e4b0bccf3b2fe4b";

const EXPECTED_HASH =
  (import.meta.env.VITE_APP_PASSWORD_HASH as string | undefined)?.trim() || FALLBACK_HASH;

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readSession(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { hash, exp } = JSON.parse(raw) as { hash: string; exp: number };
    if (Date.now() > exp) return false;
    return hash === EXPECTED_HASH;
  } catch {
    return false;
  }
}

function writeSession() {
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash: EXPECTED_HASH, exp }));
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const gateActive = EXPECTED_HASH.length === 64;
  const [unlocked, setUnlocked] = useState(() => !gateActive || readSession());
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (unlocked) return;
    const prev = document.title;
    document.title = "Dostęp ograniczony · YouLead";
    document.body.style.overflow = "hidden";
    return () => {
      document.title = prev;
      document.body.style.overflow = "";
    };
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const candidate = await sha256Hex(value);
      if (candidate === EXPECTED_HASH) {
        writeSession();
        setUnlocked(true);
      } else {
        setError("Nieprawidłowe hasło. Spróbuj ponownie.");
        setValue("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Aplikacja w tle — rozmyta, niedostępna dla focus/click/screen-reader */}
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none select-none [filter:blur(14px)_saturate(1.1)]"
      >
        {children}
      </div>

      {/* Overlay z modalem hasła */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        aria-describedby="gate-desc"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-1/30 p-6 backdrop-blur-xl"
      >
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <h1
              id="gate-title"
              className="text-center text-[20px] font-semibold tracking-tight text-ink-1"
            >
              Dostęp ograniczony
            </h1>
            <p id="gate-desc" className="mt-2 text-center text-[13px] leading-relaxed text-ink-3">
              Ten prototyp YouLead wymaga hasła. Jeśli go nie masz, poproś osobę która udostępniła
              ci link.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <div>
                <label
                  htmlFor="gate-password"
                  className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3"
                >
                  Hasło
                </label>
                <Input
                  id="gate-password"
                  type="password"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  autoComplete="current-password"
                  spellCheck={false}
                  disabled={submitting}
                  aria-invalid={!!error}
                  aria-describedby={error ? "gate-error" : undefined}
                />
              </div>

              {error && (
                <div
                  id="gate-error"
                  role="alert"
                  className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-[12px] text-danger"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={!value || submitting} className="w-full">
                {submitting ? "Sprawdzam…" : "Odblokuj"}
              </Button>
            </form>

            <p className="mt-5 text-center text-[11px] text-ink-4">
              Sesja wygasa po {SESSION_HOURS}h bezczynności.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
