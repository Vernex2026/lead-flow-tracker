<!-- Tytuł PR-a używaj Conventional Commits: feat/fix/refactor/perf/test/chore/docs(scope): summary -->

## Co zmieniono

<!-- Krótki opis zmian. 2-4 zdania. -->

## Motywacja

<!-- Po co? Bug fix, nowa funkcja, refaktor, performance — co problem rozwiązuje? -->

## Screenshots / Demo

<!-- Dla zmian UI: before/after lub video. Można usunąć jeśli nie dotyczy. -->

| Before | After |
| ------ | ----- |
|        |       |

## Jak przetestować

<!-- Kroki do zweryfikowania zmian lokalnie. -->

1. `npm install`
2. `npm run dev`
3. ...

## Checklist

- [ ] `npm run lint` zielony
- [ ] `npm run type-check` zielony
- [ ] `npm run test:ci` zielony
- [ ] `npm run build` zielony
- [ ] Zmiany działają na mobile (`<768px`) i desktop (`>=1024px`)
- [ ] Zmiany respektują dark mode (jeśli dotyczy UI)
- [ ] Zmiany respektują `prefers-reduced-motion` (jeśli dodaje animacje)
- [ ] Dodane / zaktualizowane testy dla nowej logiki (jeśli pure function lub krytyczny flow)
- [ ] Aktualizacja [CHANGELOG.md](../CHANGELOG.md) (sekcja `[Unreleased]`)

## Dodatkowy kontekst

<!-- Linki do issue, designu, dokumentacji, decyzji architektonicznych. -->
