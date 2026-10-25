import CombatCard from "./components/CombatCard.jsx";
import PlayerList from "./components/PlayerList.jsx";
import useGameState from "./hooks/useGameState.js";
import { parseStrength } from "./utils/game.js";

export default function App() {
  const game = useGameState();
  const { state, status, activePlayer, isBattleScreen, result, resultType } = game;
  const { actions } = game;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Pomocnik do gry</p>
          <h1>Munchkin <span>Zombie</span></h1>
          <p className="game-subtitle">Licznik walki · świat po apokalipsie</p>
        </div>
      </header>

      {!isBattleScreen ? (
        <>
          <p className="intro">Dodaj graczy, zapisuj ich poziomy i rozpocznij walkę jednym przyciskiem.</p>
          <PlayerList
            players={state.players}
            editing={state.rosterEditing}
            onChange={actions.changePlayer}
            onAdd={actions.addPlayer}
            onLevelChange={actions.changePlayerLevel}
            onRemove={actions.removePlayer}
            onFight={actions.startFight}
            onStartGame={actions.confirmNewGame}
            onNewGame={actions.startNewGame}
            focusPlayerId={game.focusPlayerId}
            onPlayerInputFocused={game.clearPlayerFocus}
          />
        </>
      ) : (
        <>
          <div className="battle-toolbar">
            <div>
              <p className="eyebrow">Walka gracza</p>
              <h2>{activePlayer.name || "Gracz"} <span>· poziom {parseStrength(state.playerBase)}</span></h2>
            </div>
            <button className="end-fight-button" type="button" onClick={actions.endFight}>
              Zakończ i wróć
            </button>
          </div>

          <p className="intro">Dodawaj ekwipunek i modyfikatory. Siła obu stron aktualizuje się na bieżąco.</p>

          <section className="battle-grid" aria-label="Siła w walce">
            <CombatCard
              side="player"
              title={activePlayer.name || "Gracz"}
              base={state.playerBase}
              modifiers={state.playerModifiers}
              onBaseChange={(value) => actions.changeBase("player", value)}
              onModifierChange={(id, field, value) => actions.changeModifier("player", id, field, value)}
              onModifierRemove={(id) => actions.removeModifier("player", id)}
              onAddModifier={() => actions.addModifier("player")}
            />
            <CombatCard
              side="monster"
              title="Potwór"
              base={state.monsterBase}
              modifiers={state.monsterModifiers}
              onBaseChange={(value) => actions.changeBase("monster", value)}
              onModifierChange={(id, field, value) => actions.changeModifier("monster", id, field, value)}
              onModifierRemove={(id) => actions.removeModifier("monster", id)}
              onAddModifier={() => actions.addModifier("monster")}
            />
          </section>

          <section className="result-panel" data-result={resultType} aria-live="polite">
            <span className="result-label">Wynik walki</span>
            <p>{result}</p>
          </section>
        </>
      )}

      <p className="save-note">Twój licznik zapisuje się na tym urządzeniu.</p>
      <p className="app-status" role="status" aria-live="polite">{status}</p>
    </main>
  );
}
