import { parseStrength, sum } from "../utils/game.js";

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
            placeholder="0"
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

export default function CombatCard({
  side,
  title,
  base,
  modifiers,
  onBaseChange,
  onModifierChange,
  onModifierRemove,
  onAddModifier,
}) {
  const isPlayer = side === "player";

  return (
    <article className={`combat-card ${isPlayer ? "player-card" : "monster-card"}`}>
      <div className="card-heading">
        <div>
          <p className="eyebrow">{isPlayer ? "Twoja strona" : "Przeciwnik"}</p>
          <h2>{isPlayer ? title : "Potwór"}</h2>
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
