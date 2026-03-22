import { createInitialState } from './game';

type WS = {
  send: (data: string) => void;
  data: unknown;
  id: string;
};

export type GameState = {
  players: { y: number; vy: number; score: number }[];
  ball: { x: number; y: number; vx: number; vy: number };
  status: string;
  winner?: number;
  powerUp?: { x: number; y: number; ativo: boolean };
};

export type RoomState = {
  id: string;
  connections: [WS?, WS?];
  gameState: GameState;
  loopInterval?: ReturnType<typeof setInterval>;
  readyPlayers?: Set<string>;
  nomes?: { [key: number]: string };
};

const rooms: RoomState[] = [];

export function joinRoom(ws: WS) {
  // Procura sala com apenas um jogador
  let room = rooms.find(r => r.connections.filter(Boolean).length === 1);

  if (!room) {
    room = {
      id: crypto.randomUUID(),
      connections: [ws, undefined],
      gameState: createInitialState(),
    };
    rooms.push(room);
    return { room, playerNumber: 1 };
  }

  room.connections[1] = ws;
  return { room, playerNumber: 2 };
}

export function handleMove(ws: WS, direction: 'up' | 'down' | 'stop') {
  const { room, playerIndex } = findPlayer(ws);
  if (!room || playerIndex === -1) return;

  const speed = direction === 'up' ? -6 : direction === 'down' ? 6 : 0;
  room.gameState.players[playerIndex].vy = speed;
}

export function broadcast(room: RoomState, event: object) {
  const msg = JSON.stringify(event);
  room.connections.forEach(ws => ws?.send(msg));
}

export function removeFromRoom(ws: WS) {
  const index = rooms.findIndex(r => r.connections.some(c => c?.id === ws.id));
  if (index === -1) return;

  const room = rooms[index];
  clearInterval(room.loopInterval);

  // Se o jogo ainda estava ativo, avisa o outro jogador
  const outro = room.connections.find(c => c?.id !== ws.id);
  if (outro && room.gameState.status !== 'ended') {
    outro.send(JSON.stringify({ type: 'end-game', payload: { winner: 0 } }));
  }

  rooms.splice(index, 1);
}

export function findRoomByWs(ws: WS) {
  const room = rooms.find(r => r.connections.some(c => c?.id === ws.id));
  return { room: room || null };
}

function findPlayer(ws: WS) {
  for (const room of rooms) {
    const playerIndex = room.connections.findIndex(c => c?.id === ws.id);
    if (playerIndex !== -1) return { room, playerIndex };
  }
  return { room: null, playerIndex: -1 };
}