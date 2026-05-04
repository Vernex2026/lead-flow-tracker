import { ReactNode } from "react";

type Section = { id: string; title: string; body: ReactNode };

const SECTIONS: Section[] = [
  {
    id: "diagnoza",
    title: "1. Diagnoza problemu",
    body: (
      <>
        <h3>Co było największym problemem?</h3>
        <p className="font-medium text-ink-1">Nie grafika. Nie kolory. Architektura informacji.</p>
        <p>
          Oryginalna zakładka cierpiała na jeden fundamentalny błąd projektowy:{" "}
          <strong>wszystko było w jednym miejscu, ale nic nie było na widoku</strong>. Historia
          zmian istniała, ale była ukryta za ikoną zegara — interakcja, której user musiał się
          domyślić. To klasyczne naruszenie heurystyki Nielsena #6: <em>Recognition over Recall</em>
          . System powinien pokazywać opcje, nie wymagać ich pamiętania.
        </p>
        <p>
          <strong>Drugi błąd:</strong> jeden formularz dla dwóch różnych kontekstów biznesowych —
          zmiana statusu i dodanie punktacji. To operacje o różnej częstotliwości, różnych aktorach
          (status zmienia handlowiec, scoring często system automatyczny) i różnych skutkach
          biznesowych. Wrzucenie ich do jednego formularza to brak separacji odpowiedzialności na
          poziomie UX.
        </p>
        <p>
          <strong>Trzeci, najbardziej bolesny operacyjnie:</strong> brak możliwości korekty
          historycznych wpisów. W codziennej pracy CRM błędy są normą — importy z innego systemu,
          ręczne wpisy z datą „wczoraj", korekty po rozmowie z klientem. Brak edycji historii to nie
          tylko UX-owy brak kontroli, to realne koszty operacyjne: ticket do supportu albo błędne
          dane na zawsze.
        </p>
      </>
    ),
  },
  {
    id: "decyzje",
    title: "2. Decyzje projektowe",
    body: (
      <>
        <h3>Decyzja 1 — Split-view zamiast pionowego scrollowania</h3>
        <p>
          <strong>Co zmieniłem:</strong> zrezygnowałem z jednej pionowej kolumny na rzecz układu
          dwukolumnowego: lewa kolumna (40%) to „Stan aktualny", prawa (60%) to „Historia
          aktywności".
        </p>
        <p>
          <strong>Dlaczego:</strong> użytkownik potrzebuje jednocześnie widzieć{" "}
          <em>gdzie jest lead teraz</em> i <em>jak tam trafił</em>. Pionowy scroll wymagał
          przełączania uwagi i pamiętania, co było wyżej. Split-view eliminuje ten koszt poznawczy —
          obie informacje są zawsze w polu widzenia.
        </p>
        <p>
          <strong>Wzorzec:</strong> Linear (issue panel — properties na prawo, aktywność na lewo),
          Stripe Dashboard (payment details + event log obok siebie).
        </p>
        <p>
          <strong>Kompromis:</strong> na ekranach &lt; 1024px układ składa się do jednej kolumny z
          tabami. Stracimy widoczność historii na tabletach bez kliknięcia. Decyzja świadoma —
          większość CRM jest używana na desktopie przez handlowców przy biurku.
        </p>

        <h3>Decyzja 2 — Zunifikowana oś czasu zamiast dwóch osobnych tabel</h3>
        <p>
          <strong>Co zmieniłem:</strong> zamiast „Historia zmian statusów" i „Historia zmian
          punktacji" jako oddzielne tabele — jedna chronologiczna oś czasu zawierająca oba typy
          zdarzeń plus notatki systemowe.
        </p>
        <p>
          <strong>Dlaczego:</strong> handlowiec myśli o leadzie jako o narracji, nie o bazie danych.
          „Co się ostatnio działo z tym klientem?" — to pytanie chronologiczne, nie kategoryczne.
          Dodatkowa korzyść: widać korelacje — lead dostał +15 punktów (kliknął mail) tego samego
          dnia co zmiana statusu na „Kwalifikowany". Filtry [Wszystko][ Status][Scoring] pozwalają
          wrócić do perspektywy kategorycznej, gdy user tego potrzebuje.
        </p>

        <h3>Decyzja 3 — Inline edit w popoverze, nie modal</h3>
        <p>
          Każdy wpis na osi czasu ma affordancję edycji (pojawia się na hover). Kliknięcie otwiera
          popover zakotwiczony do wiersza — nie pełnoekranowy modal.
        </p>
        <table>
          <thead>
            <tr>
              <th>Opcja</th>
              <th>Problem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Inline edit (wiersz → formularz)</td>
              <td>Niszczy rytm osi czasu, user traci kontekst sąsiednich wpisów</td>
            </tr>
            <tr>
              <td>Pełny modal</td>
              <td>Heavy — wyjście z kontekstu, blokuje widok historii</td>
            </tr>
            <tr>
              <td>Nowa strona</td>
              <td>Zbyt duży koszt nawigacyjny dla drobnej korekty daty</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Co można edytować, a czego nie:</strong>
        </p>
        <ul>
          <li>
            ✅ <code>occurredAt</code> — klucz do problemu biznesowego
          </li>
          <li>
            ✅ <code>comment</code> / <code>reason</code> — uzupełnienie, korekta notatki
          </li>
          <li>
            ❌ <code>from/to</code> w zmianie statusu — to fakt historyczny. Edytować można „kiedy"
            i „dlaczego", nie „co".
          </li>
          <li>
            ❌ <code>delta</code> w scoringu — wartości są danymi, nie metadanymi
          </li>
        </ul>

        <h3>Decyzja 4 — Audit trail zamiast cichej edycji</h3>
        <p>
          Każda edycja historycznego wpisu zostawia ślad widoczny w UI: chip <em>edytowano</em> przy
          wpisie + lista zmian dostępna po kliknięciu. Edytowalność historii to miecz obosieczny —
          daje kontrolę, ale rodzi ryzyko fałszowania. Audit trail neutralizuje to ryzyko.
        </p>

        <h3>Decyzja 5 — Sidebar nawigacyjny zamiast poziomych tabów</h3>
        <p>
          Poziome taby nie skalują się przy 11 zakładkach: overflow lub bardzo wąskie taby, brak
          grupowania, brak miejsca na liczniki. Sidebar to przemysłowy standard dla CRM: HubSpot,
          Salesforce, Pipedrive, Linear.
        </p>

        <h3>Decyzja 6 — Optimistic UI + toast z undo</h3>
        <p>
          Zapis jest natychmiastowy wizualnie (0 ms). Toast z licznikiem 5 sekund pozwala cofnąć
          akcję. Handlowiec klika „Zapisz" dziesiątki razy dziennie — każde 600 ms czekania to
          frustracja skumulowana ×50.
        </p>
      </>
    ),
  },
  {
    id: "proces",
    title: "3. Opis procesu",
    body: (
      <>
        <h3>Krok 1 — Diagnoza bez projektowania (30 min)</h3>
        <p>
          Zanim narysowałem cokolwiek, wypunktowałem co konkretnie nie działa. Nie „wygląda słabo" —
          tylko testowalne stwierdzenia:
        </p>
        <ul>
          <li>„Historia jest ukryta — nie można jej znaleźć bez wiedzy, że zegar to toggle"</li>
          <li>
            „Formularz łączy dwie niezależne operacje — jeden submit zapisuje status i scoring"
          </li>
          <li>„Nie można zmienić daty — brak kontrolki"</li>
        </ul>

        <h3>Krok 2 — Zdefiniowanie scenariuszy (nie ekranów)</h3>
        <ol>
          <li>
            Handlowiec zmienia status — jakie informacje potrzebuje? W jakiej kolejności klika?
          </li>
          <li>Handlowiec dodaje punkty — analogicznie</li>
          <li>Manager przeglądający historię leada — co chce zobaczyć na pierwszy rzut oka?</li>
          <li>Import danych z błędną datą — jak user to koryguje?</li>
        </ol>

        <h3>Krok 3 — Alternatywy odrzucone</h3>
        <table>
          <thead>
            <tr>
              <th>Wariant</th>
              <th>Opis</th>
              <th>Dlaczego odrzucony</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A: Accordion (legacy)</td>
              <td>Expandable rows jak oryginalnie</td>
              <td>Nie rozwiązuje widoczności historii</td>
            </tr>
            <tr>
              <td>B: Tabs w karcie</td>
              <td>Status / Historia jako taby</td>
              <td>Nadal ukrywa historię</td>
            </tr>
            <tr>
              <td>C: Split-view ✅</td>
              <td>Dwie kolumny zawsze widoczne</td>
              <td>Oba konteksty równocześnie</td>
            </tr>
          </tbody>
        </table>

        <h3>Krok 4 — Rapid prototyping z AI</h3>
        <p>
          Zamiast wireframów w Figma, użyłem Lovable do wygenerowania działającego prototypu React
          na podstawie szczegółowego briefu MD. Iteracja na działającym UI, nie na statycznych
          mockupach.
        </p>

        <h3>Krok 5 — Weryfikacja przeciwko problemom</h3>
        <p>
          Dla każdego z 4 problemów z briefu: czy rozwiązanie go eliminuje? Gdzie są kompromisy?
        </p>
      </>
    ),
  },
  {
    id: "narzedzia",
    title: "4. Narzędzia i workflow",
    body: (
      <>
        <table>
          <thead>
            <tr>
              <th>Narzędzie</th>
              <th>Zastosowanie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Claude (Anthropic)</td>
              <td>Analiza problemu, brief UX, design tokens, audyt prototypu</td>
            </tr>
            <tr>
              <td>Lovable</td>
              <td>Generowanie działającego prototypu React na podstawie briefu MD</td>
            </tr>
            <tr>
              <td>React 18 + TypeScript</td>
              <td>Komponentowy framework — produkcyjny standard</td>
            </tr>
            <tr>
              <td>Tailwind CSS</td>
              <td>Utility-first CSS — szybka iteracja</td>
            </tr>
            <tr>
              <td>shadcn/ui</td>
              <td>Dostępne, nieozdobne prymitywy (Select, Popover, Calendar)</td>
            </tr>
            <tr>
              <td>Framer Motion</td>
              <td>FLIP layout, przejścia 120–320 ms, prefers-reduced-motion</td>
            </tr>
            <tr>
              <td>date-fns + locale pl</td>
              <td>Formatowanie dat po polsku</td>
            </tr>
            <tr>
              <td>zustand</td>
              <td>Globalny state dla optimistic UI i undo</td>
            </tr>
            <tr>
              <td>lucide-react</td>
              <td>Ikonografia — konsekwentnie 20 px</td>
            </tr>
          </tbody>
        </table>

        <h3>Jak AI wpłynęło na proces?</h3>
        <p>
          <strong>Używałem AI do:</strong>
        </p>
        <ul>
          <li>Syntezy problemów z briefu w testowalne wymagania</li>
          <li>Generowania design tokens (60+ CSS custom properties)</li>
          <li>Weryfikacji decyzji przeciwko wzorcom (Linear, Stripe, Apple HIG)</li>
          <li>Generowania danych przykładowych TypeScript (18 eventów)</li>
          <li>Audytu prototypu przeciwko WCAG 2.2 AA</li>
        </ul>
        <p>
          <strong>Czego AI nie zrobiło:</strong>
        </p>
        <ul>
          <li>
            Nie podjęło decyzji architektonicznej (split-view vs tabs) — wymagała kontekstu
            biznesowego
          </li>
          <li>
            Nie zdefiniowało co jest edytowalne — wymagało rozumienia integralności danych CRM
          </li>
          <li>Nie napisało kompromisów — wynikają z doświadczenia</li>
        </ul>
        <p className="text-ink-1 font-medium">
          AI to narzędzie przyspieszające egzekucję, nie zastępujące myślenie produktowe.
        </p>
      </>
    ),
  },
  {
    id: "kompromisy",
    title: "5. Kompromisy i ograniczenia",
    body: (
      <ul>
        <li>
          <strong>Wersjonowanie historii zamiast edycji</strong> — najbezpieczniejszy UX-owo wzorzec
          to niezmienialność + wpisy korekcyjne (Event Sourcing). Odrzucone: komplikuje UI i nie
          pasuje do oczekiwania biznesowego.
        </li>
        <li>
          <strong>Mobile-first</strong> — desktop-first, bo CRM jest używany przy biurku.
          Responsywność istnieje (taby &lt; 1024 px), nie była priorytetem.
        </li>
        <li>
          <strong>RBAC</strong> — w prototypie każdy edytuje wszystko. W produkcji integracja z
          permission systemem.
        </li>
        <li>
          <strong>Keyboard shortcuts</strong> — zaplanowane (J/K, E, ⌘Z), w prototypie częściowo.
        </li>
      </ul>
    ),
  },
  {
    id: "dalej",
    title: "6. Co zrobiłbym dalej (w produkcji)",
    body: (
      <ol>
        <li>
          <strong>Testy z użytkownikami</strong> — 5 sesji z handlowcami, mierzone czasy, błędy,
          frustracje.
        </li>
        <li>
          <strong>RBAC na edycję historii</strong> — integracja z permission systemem YouLead.
        </li>
        <li>
          <strong>Multiple funnels</strong> — kontakt w 3 lejkach: oś globalna czy per-lejek?
        </li>
        <li>
          <strong>Export historii</strong> — manager chce CSV.
        </li>
        <li>
          <strong>Bulk operations</strong> — zaznacz 5 wpisów → zmień daty masowo (scenariusz
          importu).
        </li>
      </ol>
    ),
  },
];

export function DocsPanel() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Dokumentacja projektu
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-1">
          Redesign zakładki „Lejki"
        </h1>
        <p className="mt-2 text-sm text-ink-3">
          YouLead CRM — Karta klienta · Stack: React 18 · TypeScript · Tailwind · shadcn/ui · Framer
          Motion
        </p>
      </div>

      <nav className="mb-10 rounded-lg border border-border bg-surface p-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          Spis treści
        </div>
        <ol className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-ink-2 hover:text-ink-1 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 rounded-lg border border-border bg-surface p-7 shadow-xs"
          >
            <h2 className="mb-5 text-[20px] font-semibold tracking-tight text-ink-1">{s.title}</h2>
            <div className="docs-prose space-y-4 text-[14px] leading-relaxed text-ink-2">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-10 border-t border-border pt-6 text-[12px] text-ink-3">
        Projekt: Redesign zakładki Lejki — YouLead CRM · Maj 2026
      </footer>
    </div>
  );
}
