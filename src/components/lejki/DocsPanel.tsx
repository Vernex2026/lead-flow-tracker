const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "filozofia",
    title: "Filozofia projektu",
    body: (
      <>
        <p>
          Redesign zakładki <strong>Lejki</strong> opiera się na zasadzie{" "}
          <em>Silent Luxury</em>: interfejs ma znikać, a treść — status i punktacja leada — ma
          być od razu czytelna. Każdy piksel musi mieć powód. Dlatego unikamy dekoracji,
          gradientów, agresywnych kolorów i „materiałowych" cieni.
        </p>
        <p>
          Główny cel zakładki to dwie operacje sprzedażowe wykonywane wielokrotnie dziennie:
          <strong> zmiana statusu</strong> oraz <strong>dopisywanie punktów</strong>. Cała
          architektura informacji wynika z tego, że muszą one być wykonywalne w 1–2
          kliknięciach, z pełną historią zmian dostępną obok.
        </p>
      </>
    ),
  },
  {
    id: "uklad",
    title: "Układ — split view 5/7",
    body: (
      <>
        <p>
          Zastosowaliśmy podział 12-kolumnowy: <strong>Stan aktualny (5)</strong> po lewej i{" "}
          <strong>Historia aktywności (7)</strong> po prawej. Lewa kolumna jest węższa, bo
          zawiera krótkie karty (status, punktacja, opiekun); prawa — szersza, bo timeline
          wymaga miejsca na komentarze i metadane.
        </p>
        <p>
          Poniżej breakpointa <code>lg</code> (1024px) layout przełącza się w zakładki
          (Tabs), żeby nie zmuszać użytkownika do przewijania w pionie przez całą stronę.
        </p>
      </>
    ),
  },
  {
    id: "sidebar",
    title: "Sidebar — nawigacja kontaktu",
    body: (
      <>
        <p>
          Lewy sidebar zastąpił horyzontalne taby z oryginalnego YouLeada. Powód:{" "}
          <strong>poziome taby przestają się skalować</strong> przy 8+ pozycjach i wymuszają
          skrót lub overflow. Sidebar utrzymuje kontekst (avatar + nazwa) cały czas widoczny,
          a podział na grupy (Profil, Sprzedaż, Aktywność, Komercja, Automatyzacja, Pomoc)
          tworzy mentalną mapę.
        </p>
        <p>
          <strong>Stan zwinięty (56px)</strong> pokazuje tylko ikony Lucide z tooltipami
          Radix (delay 120ms — nie 5 sekund jak natywny <code>title</code>).{" "}
          <strong>Stan rozwinięty (240px)</strong> pokazuje etykiety i nagłówki grup
          „sztywno" napisane nad każdym blokiem. Przełącznik <em>PanelLeft</em> w headerze
          jest zawsze dostępny.
        </p>
      </>
    ),
  },
  {
    id: "komponenty",
    title: "Użyte komponenty",
    body: (
      <>
        <ul>
          <li>
            <strong>shadcn/ui</strong> (Radix pod spodem): <code>Select</code>,{" "}
            <code>Popover</code>, <code>Calendar</code>, <code>Tabs</code>,{" "}
            <code>Tooltip</code>, <code>HoverCard</code>, <code>Button</code>. Brak natywnych
            <code>&lt;select&gt;</code> i <code>&lt;input type="datetime-local"&gt;</code>.
          </li>
          <li>
            <strong>Framer Motion</strong> — <code>layout</code>/<code>LayoutGroup</code> dla
            FLIP-animacji w timeline, <code>AnimatePresence</code> dla edycji inline.
          </li>
          <li>
            <strong>Zustand + persist</strong> — pojedyncze źródło prawdy (event stream).
            Status i punktacja są <em>derive'owane</em> z eventów, nie przechowywane osobno.
          </li>
          <li>
            <strong>Lucide React</strong> — ikony 1.75px stroke, neutralny kontur.
          </li>
          <li>
            <strong>Sonner</strong> — toasty z akcją <em>Cofnij</em> (5 sekund).
          </li>
        </ul>
        <p>
          Własne prymitywy: <code>DateTimePicker</code> (Popover + Calendar + numeric time),{" "}
          <code>NumberStepper</code> (jedno pole z inline +/−), <code>AutoTextarea</code>{" "}
          (auto-grow, brak resize-handle), <code>Sparkline</code>, <code>StatusChip</code>,{" "}
          <code>TrendPill</code>, <code>ScoreBar</code>.
        </p>
      </>
    ),
  },
  {
    id: "tokeny",
    title: "Design tokens",
    body: (
      <>
        <p>
          Wszystkie kolory są w HSL, w <code>index.css</code>, jako semantyczne zmienne CSS.
          Komponenty <strong>nigdy</strong> nie używają hex-ów ani klas typu{" "}
          <code>text-white</code>. Skala:
        </p>
        <ul>
          <li>
            <code>--bg</code>, <code>--surface</code>, <code>--surface-2/3</code> — tła
          </li>
          <li>
            <code>--ink-1..4</code> — hierarchia tekstu (od najmocniejszego do
            najsłabszego)
          </li>
          <li>
            <code>--accent-500/600/700</code> — kolor marki (czerwony YouLead)
          </li>
          <li>
            <code>--status-{`{new|qualified|opportunity|won|lost}`}</code> — pary tło + fg
            dla chipów statusu
          </li>
          <li>
            <code>--success/warn/info/danger</code> — semantyka systemowa
          </li>
        </ul>
        <p>
          Promień: <code>--radius: 10px</code>. Cienie: 4-stopniowa skala{" "}
          <code>shadow-xs..lg</code>. Tryb ciemny przedefiniowuje tylko warstwę
          surface/ink/border — reszta tokenów się dziedziczy.
        </p>
      </>
    ),
  },
  {
    id: "dlaczego",
    title: "Decyzje — dlaczego tak, nie inaczej",
    body: (
      <ul>
        <li>
          <strong>Event-sourced state.</strong> Status to nie pole — to ostatni event typu{" "}
          <code>status_change</code>. Pozwala to na tryvialne <em>undo</em>, audit trail i
          edycję historyczną bez desync'u.
        </li>
        <li>
          <strong>Inline edit zamiast modali.</strong> Modal zrywa kontekst. Edycja w karcie
          (StatusCard, ScoringCard) zachowuje widok obok stanu, do którego użytkownik wraca.
        </li>
        <li>
          <strong>Sentence-case zamiast ALL CAPS</strong> w labelach formularzy. Wielkie
          litery są zarezerwowane dla nagłówków sekcji (eyebrow), żeby utrzymać hierarchię.
        </li>
        <li>
          <strong>Tabular numerals (<code>tnum</code>)</strong> dla wszystkich liczb (score,
          delta, daty). Eliminuje skakanie szerokości przy animacji liczników.
        </li>
        <li>
          <strong>Sparkline bez kropki końcowej.</strong> Czerwona kropka dodawała wizualnego
          szumu i konkurowała z kolorem marki — usunięta na rzecz neutralnego konturu.
        </li>
        <li>
          <strong>Tooltip 120ms.</strong> Natywne <code>title</code> pokazuje się po ~5
          sekundach (kontrolowane przez OS) — niedopuszczalne dla nawigacji ikon. Radix daje
          nam pełną kontrolę.
        </li>
      </ul>
    ),
  },
  {
    id: "dostepnosc",
    title: "Dostępność",
    body: (
      <ul>
        <li>Focus-visible: 2px outline w kolorze akcentu, offset 2px.</li>
        <li>
          <code>prefers-reduced-motion</code> — wszystkie animacje skracane do 0.01ms.
        </li>
        <li>
          Każdy chip statusu ma <code>aria-label</code>; ScoreBar ma rolę{" "}
          <code>progressbar</code> z <code>aria-valuenow/min/max</code>.
        </li>
        <li>Przyciski ikon mają <code>aria-label</code> w języku polskim.</li>
        <li>Kontrast tekstu spełnia WCAG AA w obu motywach (jasny i ciemny).</li>
      </ul>
    ),
  },
];

export function DocsPanel() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">Dokumentacja</h1>
        <p className="mt-1 text-sm text-ink-3">
          Decyzje projektowe, użyte komponenty i tokeny — dlaczego ten interfejs wygląda tak,
          jak wygląda.
        </p>
      </div>

      <nav className="mb-8 rounded-lg border border-border bg-surface p-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          Spis treści
        </div>
        <ol className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="tnum text-ink-2 hover:text-ink-1 hover:underline"
              >
                {String(i + 1).padStart(2, "0")}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {SECTIONS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="rounded-lg border border-border bg-surface p-6 shadow-xs scroll-mt-24"
          >
            <div className="mb-3 flex items-baseline gap-3">
              <span className="tnum text-[11px] font-semibold uppercase tracking-wider text-ink-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="text-[18px] font-semibold tracking-tight text-ink-1">
                {s.title}
              </h2>
            </div>
            <div className="prose-docs space-y-3 text-[14px] leading-relaxed text-ink-2">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
