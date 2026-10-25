export const STORAGE_KEY = "munchkin-combat-counter-v1";
export const SORT_DELAY_MS = 700;

export const DEFAULT_STATE = {
  playerBase: 1,
  monsterBase: 0,
  playerModifiers: [],
  monsterModifiers: [],
  players: [],
  activePlayerId: null,
  screen: "players",
  rosterEditing: true,
};

export function toInteger(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

export function parseStrength(value) {
  if (typeof value === "number") return toInteger(value);
  if (!/^-?\d+$/.test(value)) return 0;
  return toInteger(value);
}

function storedStrength(value, fallback) {
  if (typeof value === "string") return value;
  return String(toInteger(value, fallback));
}

export function createId() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();

  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizePlayers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((player) => player && typeof player === "object")
    .map((player, index) => ({
      id: typeof player.id === "string" ? player.id : createId(),
      name: typeof player.name === "string" ? player.name : `Gracz ${index + 1}`,
      level: storedStrength(player.level, 1),
    }));
}

function normalizeModifiers(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId(),
      name: typeof item.name === "string" ? item.name : "",
      value: storedStrength(item.value, 0),
    }));
}

export function readSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: DEFAULT_STATE, error: "" };

    const parsed = JSON.parse(saved);
    const players = normalizePlayers(parsed.players);
    const activePlayerId = typeof parsed.activePlayerId === "string"
      && players.some((player) => player.id === parsed.activePlayerId)
      ? parsed.activePlayerId
      : null;
    return {
      data: {
        playerBase: storedStrength(parsed.playerBase, DEFAULT_STATE.playerBase),
        monsterBase: storedStrength(parsed.monsterBase, DEFAULT_STATE.monsterBase),
        playerModifiers: normalizeModifiers(parsed.playerModifiers),
        monsterModifiers: normalizeModifiers(parsed.monsterModifiers),
        players,
        activePlayerId,
        screen: parsed.screen === "battle" && activePlayerId ? "battle" : "players",
        rosterEditing: typeof parsed.rosterEditing === "boolean"
          ? parsed.rosterEditing
          : players.length === 0,
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

export function sum(base, modifiers) {
  return modifiers.reduce((total, modifier) => total + parseStrength(modifier.value), parseStrength(base));
}

export function sortPlayers(players) {
  return [...players].sort((a, b) => (
    parseStrength(b.level) - parseStrength(a.level)
    || a.name.localeCompare(b.name, "pl", { sensitivity: "base" })
  ));
}
