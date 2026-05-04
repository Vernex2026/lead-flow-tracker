import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sha256Hex } from "@/lib/crypto";
import { HOUR_MS } from "@/lib/time";

const STORAGE_KEY = "yl_gate_token_v1";
const SESSION_HOURS = 24;
const SHA256_HEX_LENGTH = 64;

// SHA-256 hash of "Vernex123!@#". Wbudowane jako fallback żeby gate
// działał out-of-the-box (Lovable preview, Vercel bez env var, etc.).
// Możesz nadpisać dla innego hasła per environment przez VITE_APP_PASSWORD_HASH.
const FALLBACK_HASH =
  "161412538c1bc2b627cedc3e579a30fcc709bf783ed285e36e4b0bccf3b2fe4b";

const EXPECTED_HASH =
  (import.meta.env.VITE_APP_PASSWORD_HASH as string | undefined)?.trim() ||
  FALLBACK_HASH;

interface SessionToken {
  hash: string;
  exp: number;
}

const readSession = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { hash, exp } = JSON.parse(raw) as SessionToken;
    return Date.now() <= exp && hash === EXPECTED_HASH;
  } catch {
    return false;
  }
};

const writeSession = () => {
  const token: SessionToken = {
    hash: EXPECTED_HASH,
    exp: Date.now() + SESSION_HOURS * HOUR_MS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
};

export function PasswordGate({ children }: { children: ReactNode }) {
  const gateActive = EXPECTED_HASH.length === SHA256_HEX_LENGTH;
  const [unlocked, setUnlocked] = useState(() => !gateActive || readSession());
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (unlocked) return;
    const previousTitle = document.title;
    document.title = "Dostęp ograniczony · YouLead";
    document.body.style.overflow = "hidden";
    return () => {
      document.title = previousTitle;
      document.body.style.overflow = "";
    };
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
      <div
        aria-hidden="true"
        // @ts-expect-error inert is a valid HTML attribute (React 19+; works in 18 via DOM).
        inert=""
        className="pointer-events-none select-none [filter:blur(14px)_saturate(1.1)]"
      >
        {children}
      </div>

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
            <p
              id="gate-desc"
              className="mt-2 text-center text-[13px] leading-relaxed text-ink-3"
            >
              Ten prototyp YouLead wymaga hasła. Jeśli go nie masz, poproś osobę,
              która udostępniła ci link.
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
                  onChange={(event) => {
                    setValue(event.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  autoComplete="current-password"
                  spellCheck={false}
                  disabled={submitting}
                  aria-invalid={Boolean(error)}
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
