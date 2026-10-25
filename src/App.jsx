import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "munchkin-combat-counter-v1";
const DEFAULT_STATE = {
  playerBase: 1,
  monsterBase: 0,
  playerModifiers: [],
  monsterModifiers: [],
};

function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

function parseStrength(value) {
  if (typeof value === "number") return toInteger(value);
  if (!/^-?\d+$/.test(value)) return 0;
  return toInteger(value);
}

function storedStrength(value, fallback) {
  if (typeof value === "string") return value;
  return String(toInteger(value, fallback));
}

function normalizeModifiers(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      name: typeof item.name === "string" ? item.name : "",
      value: storedStrength(item.value, 0),
    }));
}

function readSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: DEFAULT_STATE, error: "" };

    const parsed = JSON.parse(saved);
    return {
      data: {
        playerBase: storedStrength(parsed.playerBase, DEFAULT_STATE.playerBase),
        monsterBase: storedStrength(parsed.monsterBase, DEFAULT_STATE.monsterBase),
        playerModifiers: normalizeModifiers(parsed.playerModifiers),
        monsterModifiers: normalizeModifiers(parsed.monsterModifiers),
      },
      error: "",
    };
  } catch {
    return {
      data: DEFAULT_STATE,
      error: "Nie udało się odczytać zapisu. Licznik uruchomił się z wartościami początkowymi.",
    };
  }
}

function sum(base, modifiers) {
  return modifiers.reduce((total, modifier) => total + parseStrength(modifier.value), parseStrength(base));
}

function ModifierList({ side, modifiers, onChange, onRemove }) {
  const isPlayer = side === "player";

  return (
    <ul className="modifier-list" aria-label={isPlayer ? "Ekwipunek i bonusy gracza" : "Modyfikatory potwora"}>
      {modifiers.map((modifier) => (
        <li className="modifier-row" key={modifier.id}>
          <input
            type="text"
            placeholder={isPlayer ? "Nazwa przedmiotu lub bonusu" : "Nazwa modyfikatora"}
            aria-label={`Nazwa składnika ${isPlayer ? "gracza" : "potwora"}`}
            value={modifier.name}
            onChange={(event) => onChange(modifier.id, "name", event.target.value)}
          />
          <input
            className="modifier-value"
            type="text"
            inputMode="text"
            placeholder="+3"
            aria-label={`Siła składnika: ${modifier.name || "bez nazwy"}`}
            value={modifier.value}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => onChange(modifier.id, "value", event.target.value)}
          />
          <button
            className="remove-button"
            type="button"
            aria-label={`Usuń składnik: ${modifier.name || "bez nazwy"}`}
            onClick={() => onRemove(modifier.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}

function CombatCard({ side, base, modifiers, onBaseChange, onModifierChange, onModifierRemove, onAddModifier }) {
  const isPlayer = side === "player";

  return (
    <article className={`combat-card ${isPlayer ? "player-card" : "monster-card"}`}>
      <div className="card-heading">
        <div>
          <p className="eyebrow">{isPlayer ? "Twoja strona" : "Przeciwnik"}</p>
          <h2>{isPlayer ? "Gracz" : "Potwór"}</h2>
        </div>
        <span className="total" aria-live="polite">{sum(base, modifiers)}</span>
      </div>

      <label className="base-field">
        <span>{isPlayer ? "Poziom gracza" : "Siła potwora"}</span>
        <input
          type="text"
          inputMode="text"
          placeholder={isPlayer ? "Poziom" : "Siła"}
          value={base}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => onBaseChange(event.target.value)}
        />
      </label>

      <div className="modifier-heading">
        <h3>{isPlayer ? "Ekwipunek i bonusy" : "Modyfikatory"}</h3>
        <span>{isPlayer ? "np. Miecz +3, klątwa -1" : "np. Wędrujący potwór, premia +5"}</span>
      </div>
      <ModifierList
        side={side}
        modifiers={modifiers}
        onChange={onModifierChange}
        onRemove={onModifierRemove}
      />
      <button className="add-button" type="button" onClick={onAddModifier}>+ Dodaj składnik</button>
    </article>
  );
}

export default function App() {
  const [initial] = useState(readSavedState);
  const [state, setState] = useState(initial.data);
  const [status, setStatus] = useState(initial.error);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true,
  );
  const dialogRef = useRef(null);

  const playerTotal = sum(state.playerBase, state.playerModifiers);
  const monsterTotal = sum(state.monsterBase, state.monsterModifiers);

  useEffect(() => {
    if (!showInstallHelp || !dialogRef.current || dialogRef.current.open) return;
    dialogRef.current.showModal();
  }, [showInstallHelp]);

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setStatus("Aplikacja została dodana do ekranu głównego.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function updateState(nextState) {
    setState(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      setStatus("");
    } catch {
      setStatus("Nie udało się zapisać zmian na tym urządzeniu.");
    }
  }

  function changeBase(side, value) {
    updateState({ ...state, [`${side}Base`]: value });
  }

  function changeModifier(side, id, field, value) {
    const key = `${side}Modifiers`;
    updateState({
      ...state,
      [key]: state[key].map((modifier) => (
        modifier.id === id ? { ...modifier, [field]: value } : modifier
      )),
    });
  }

  function addModifier(side) {
    const key = `${side}Modifiers`;
    updateState({
      ...state,
      [key]: [...state[key], { id: crypto.randomUUID(), name: "", value: "" }],
    });
  }

  function removeModifier(side, id) {
    const key = `${side}Modifiers`;
    updateState({
      ...state,
      [key]: state[key].filter((modifier) => modifier.id !== id),
    });
  }

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setStatus(choice.outcome === "accepted"
        ? "Aplikacja została dodana do ekranu głównego."
        : "Instalacja została anulowana.");
      setInstallPrompt(null);
      return;
    }
    setShowInstallHelp(true);
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  let result;
  let resultType = "";
  if (monsterTotal === 0 && state.monsterModifiers.length === 0) {
    result = "Wpisz siłę potwora, aby sprawdzić wynik.";
  } else if (playerTotal > monsterTotal) {
    result = `Gracz wygrywa! Ma ${playerTotal - monsterTotal} siły więcej.`;
    resultType = "win";
  } else if (playerTotal === monsterTotal) {
    result = "Remis — gracz nie pokonuje potwora.";
  } else {
    result = `Potwór jest silniejszy o ${monsterTotal - playerTotal}.`;
    resultType = "loss";
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Pomocnik do gry</p>
          <h1>Munchkin <span>Zombie</span></h1>
          <p className="game-subtitle">Licznik walki · świat po apokalipsie</p>
        </div>
        {!isInstalled && (
          <button className="install-button" type="button" onClick={handleInstall}>Dodaj do ekranu</button>
        )}
      </header>

      <p className="intro">Dodawaj poziom, ekwipunek i modyfikatory. Siła obu stron aktualizuje się na bieżąco.</p>

      <section className="battle-grid" aria-label="Siła w walce">
        <CombatCard
          side="player"
          base={state.playerBase}
          modifiers={state.playerModifiers}
          onBaseChange={(value) => changeBase("player", value)}
          onModifierChange={(id, field, value) => changeModifier("player", id, field, value)}
          onModifierRemove={(id) => removeModifier("player", id)}
          onAddModifier={() => addModifier("player")}
        />
        <CombatCard
          side="monster"
          base={state.monsterBase}
          modifiers={state.monsterModifiers}
          onBaseChange={(value) => changeBase("monster", value)}
          onModifierChange={(id, field, value) => changeModifier("monster", id, field, value)}
          onModifierRemove={(id) => removeModifier("monster", id)}
          onAddModifier={() => addModifier("monster")}
        />
      </section>

      <section className="result-panel" data-result={resultType} aria-live="polite">
        <span className="result-label">Wynik walki</span>
        <p>{result}</p>
      </section>

      <p className="save-note">Twój licznik zapisuje się na tym urządzeniu.</p>
      <p className="app-status" role="status" aria-live="polite">{status}</p>

      <dialog
        className="install-dialog"
        ref={dialogRef}
        onClose={() => setShowInstallHelp(false)}
      >
        <form method="dialog">
          <button className="dialog-close" aria-label="Zamknij" type="submit">×</button>
        </form>
        <h2>Dodaj licznik do ekranu głównego</h2>
        <p>
          {isIOS
            ? "W Safari stuknij przycisk Udostępnij, a następnie wybierz „Do ekranu początkowego”."
            : "Otwórz menu przeglądarki i wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”."}
        </p>
        <p>Po dodaniu aplikacja będzie dostępna z ekranu głównego i będzie działać offline.</p>
        <form method="dialog"><button className="dialog-done" type="submit">Gotowe</button></form>
      </dialog>
    </main>
  );
}
