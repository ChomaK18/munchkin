import { useState } from "react";
import { createId, parseStrength, readSavedState, sum, STORAGE_KEY } from "../utils/game.js";

export default function useGameState() {
  const [initial] = useState(readSavedState);
  const [state, setState] = useState(initial.data);
  const [status, setStatus] = useState(initial.error);
  const [focusPlayerId, setFocusPlayerId] = useState(null);

  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  const playerTotal = sum(state.playerBase, state.playerModifiers);
  const monsterTotal = sum(state.monsterBase, state.monsterModifiers);
  const isBattleScreen = state.screen === "battle" && activePlayer;

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
    const nextState = { ...state, [`${side}Base`]: value };
    if (side === "player" && state.activePlayerId) {
      nextState.players = state.players.map((player) => (
        player.id === state.activePlayerId ? { ...player, level: value } : player
      ));
    }
    updateState(nextState);
  }

  function addPlayer() {
    const id = createId();
    setFocusPlayerId(id);
    updateState({
      ...state,
      players: [...state.players, { id, name: "", level: "1" }],
    });
  }

  function changePlayer(id, field, value) {
    updateState({
      ...state,
      players: state.players.map((player) => (
        player.id === id ? { ...player, [field]: value } : player
      )),
    });
  }

  function changePlayerLevel(id, amount) {
    const player = state.players.find((item) => item.id === id);
    if (!player) return;
    changePlayer(id, "level", String(Math.max(1, parseStrength(player.level) + amount)));
  }

  function removePlayer(id) {
    updateState({
      ...state,
      players: state.players.filter((player) => player.id !== id),
    });
  }

  function startNewGame() {
    updateState({
      ...state,
      players: state.players.map((player) => ({ ...player, level: "1" })),
      activePlayerId: null,
      screen: "players",
      rosterEditing: true,
      playerBase: "1",
      playerModifiers: [],
      monsterBase: "0",
      monsterModifiers: [],
    });
  }

  function confirmNewGame() {
    if (state.players.length === 0 || state.players.some((player) => !player.name.trim())) return;
    updateState({ ...state, rosterEditing: false });
  }

  function startFight(id) {
    if (state.rosterEditing) return;
    const player = state.players.find((item) => item.id === id);
    if (!player) return;
    updateState({
      ...state,
      activePlayerId: player.id,
      screen: "battle",
      rosterEditing: false,
      playerBase: player.level,
      playerModifiers: [],
      monsterBase: "0",
      monsterModifiers: [],
    });
  }

  function endFight() {
    updateState({ ...state, activePlayerId: null, screen: "players" });
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
      [key]: [...state[key], { id: createId(), name: "", value: "" }],
    });
  }

  function removeModifier(side, id) {
    const key = `${side}Modifiers`;
    updateState({
      ...state,
      [key]: state[key].filter((modifier) => modifier.id !== id),
    });
  }

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

  return {
    state,
    status,
    activePlayer,
    isBattleScreen,
    result,
    resultType,
    focusPlayerId,
    clearPlayerFocus: () => setFocusPlayerId(null),
    actions: {
      changeBase,
      addPlayer,
      changePlayer,
      changePlayerLevel,
      removePlayer,
      startNewGame,
      confirmNewGame,
      startFight,
      endFight,
      changeModifier,
      addModifier,
      removeModifier,
    },
  };
}
