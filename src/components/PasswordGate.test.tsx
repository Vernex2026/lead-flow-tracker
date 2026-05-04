/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordGate } from "./PasswordGate";

// SHA-256("Vernex123!@#") — ten sam hash co w komponencie (FALLBACK_HASH).
const KNOWN_PASSWORD = "Vernex123!@#";

beforeEach(() => {
  localStorage.clear();
  // Polyfill crypto.subtle dla node.js < 19 / starszego jsdom (na wszelki wypadek)
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: { subtle: { digest: vi.fn() } },
      configurable: true,
    });
  }
});

describe("PasswordGate", () => {
  it("blokuje dostęp i pokazuje formę gdy brak sesji", () => {
    render(
      <PasswordGate>
        <div data-testid="protected-content">SECRET</div>
      </PasswordGate>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    // Children są w DOM (blur effect), ale pod aria-hidden inert wrapper
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("pokazuje błąd dla nieprawidłowego hasła", async () => {
    const user = userEvent.setup();
    render(
      <PasswordGate>
        <div>SECRET</div>
      </PasswordGate>,
    );

    const input = screen.getByLabelText(/hasło/i);
    await user.type(input, "BadPassword!");
    await user.click(screen.getByRole("button", { name: /odblokuj/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/nieprawidłowe hasło/i);
  });

  it("odblokowuje aplikację po wpisaniu prawidłowego hasła", async () => {
    const user = userEvent.setup();
    render(
      <PasswordGate>
        <div data-testid="protected-content">SECRET</div>
      </PasswordGate>,
    );

    const input = screen.getByLabelText(/hasło/i);
    await user.type(input, KNOWN_PASSWORD);
    await user.click(screen.getByRole("button", { name: /odblokuj/i }));

    // Po unlock dialog znika
    expect(await screen.findByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Sesja zapisana w localStorage
    const session = localStorage.getItem("yl_gate_token_v1");
    expect(session).toBeTruthy();
    expect(JSON.parse(session!).hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("respektuje istniejącą sesję — nie pokazuje formy", () => {
    // Pre-populate localStorage z ważną sesją
    const FALLBACK_HASH =
      "161412538c1bc2b627cedc3e579a30fcc709bf783ed285e36e4b0bccf3b2fe4b";
    localStorage.setItem(
      "yl_gate_token_v1",
      JSON.stringify({
        hash: FALLBACK_HASH,
        exp: Date.now() + 86_400_000,
      }),
    );

    render(
      <PasswordGate>
        <div data-testid="protected-content">SECRET</div>
      </PasswordGate>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("ignoruje wygasłą sesję i pokazuje formę", () => {
    localStorage.setItem(
      "yl_gate_token_v1",
      JSON.stringify({
        hash: "any",
        exp: Date.now() - 1000, // wygasła sekundę temu
      }),
    );

    render(
      <PasswordGate>
        <div>SECRET</div>
      </PasswordGate>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ignoruje uszkodzoną sesję w localStorage", () => {
    localStorage.setItem("yl_gate_token_v1", "{not valid json");

    render(
      <PasswordGate>
        <div>SECRET</div>
      </PasswordGate>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
