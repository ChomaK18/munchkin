import { useEffect, useRef, useState } from "react";
import { parseStrength, sortPlayers, SORT_DELAY_MS } from "../utils/game.js";

export default function PlayerList({
  players,
  editing,
  onChange,
  onAdd,
  onLevelChange,
  onRemove,
  onFight,
  onStartGame,
  onNewGame,
  focusPlayerId,
  onPlayerInputFocused,
}) {
  const [sortedPlayerIds, setSortedPlayerIds] = useState(() => (
    (editing ? players : sortPlayers(players)).map((player) => player.id)
  ));
  const [blurredEmptyNameIds, setBlurredEmptyNameIds] = useState([]);
  const playerInputRefs = useRef(new Map());

  useEffect(() => {
    if (editing) {
      setSortedPlayerIds(players.map((player) => player.id));
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => setSortedPlayerIds(sortPlayers(players).map((player) => player.id)),
      SORT_DELAY_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [players, editing]);

  useEffect(() => {
    if (!focusPlayerId) return;
    playerInputRefs.current.get(focusPlayerId)?.focus();
    onPlayerInputFocused();
  }, [focusPlayerId, onPlayerInputFocused]);

  const playersById = new Map(players.map((player) => [player.id, player]));
  const displayedPlayers = editing
    ? players
    : sortedPlayerIds.map((id) => playersById.get(id)).filter(Boolean);

  return (
    <section className="roster" aria-labelledby="roster-title">
      {editing && (
        <div className="roster-setup-heading">
          <h2 id="roster-title">Nowa gra</h2>
        </div>
      )}

      {players.length === 0 ? (
        <p className="empty-roster">Dodaj graczy, aby śledzić ich poziomy i rozpoczynać walki.</p>
      ) : (
        <>
          {editing && <p className="setup-hint">Wpisz imiona graczy. Nowa gra zaczyna się od poziomu 1.</p>}
          <ul className={`player-list${editing ? " is-editing" : ""}`}>
            {!editing && (
              <li className="player-list-heading" aria-hidden="true">
                <span>Gracze</span>
                <span>Poziom</span>
                <span />
              </li>
            )}
            {displayedPlayers.map((player) => (
              <li className={`player-row${editing ? " is-editing" : ""}`} key={player.id}>
                {editing ? (
                  <input
                    className={`player-name${blurredEmptyNameIds.includes(player.id) && !player.name.trim() ? " is-missing" : ""}`}
                    type="text"
                    aria-label="Nazwa gracza"
                    placeholder="Imię gracza"
                    value={player.name}
                    ref={(input) => {
                      if (input) playerInputRefs.current.set(player.id, input);
                      else playerInputRefs.current.delete(player.id);
                    }}
                    onChange={(event) => onChange(player.id, "name", event.target.value)}
                    onBlur={(event) => {
                      setBlurredEmptyNameIds((ids) => (
                        event.target.value.trim()
                          ? ids.filter((id) => id !== player.id)
                          : ids.includes(player.id) ? ids : [...ids, player.id]
                      ));
                    }}
                  />
                ) : (
                  <span className="player-name-label">{player.name}</span>
                )}
                {!editing && (
                  <div className="player-level-column">
                    <div className="level-control" aria-label={`Poziom gracza ${player.name || "bez nazwy"}`}>
                      <button
                        className="level-button"
                        type="button"
                        aria-label={`Zmniejsz poziom gracza ${player.name || "bez nazwy"}`}
                        onClick={() => onLevelChange(player.id, -1)}
                      >
                        −
                      </button>
                      <span className="player-level">{parseStrength(player.level)}</span>
                      <button
                        className="level-button"
                        type="button"
                        aria-label={`Zwiększ poziom gracza ${player.name || "bez nazwy"}`}
                        onClick={() => onLevelChange(player.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                {editing ? (
                  <button
                    className="remove-button player-remove"
                    type="button"
                    aria-label={`Usuń gracza ${player.name || "bez nazwy"}`}
                    onClick={() => onRemove(player.id)}
                  >
                    ×
                  </button>
                ) : (
                  <button className="fight-button" type="button" onClick={() => onFight(player.id)}>
                    Walka
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {editing ? (
        <>
          <button className="add-player-button" type="button" onClick={onAdd}>+ Dodaj gracza</button>
          <button
            className="start-game-button"
            type="button"
            onClick={onStartGame}
            disabled={players.length === 0 || players.some((player) => !player.name.trim())}
          >
            Rozpocznij grę
          </button>
        </>
      ) : (
        <div className="roster-toolbar">
          <button className="new-game-button" type="button" onClick={onNewGame}>Nowa gra</button>
        </div>
      )}
    </section>
  );
}
