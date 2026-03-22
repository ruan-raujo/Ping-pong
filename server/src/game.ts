import { broadcast } from './room';
import type { RoomState, GameState } from './room';

const CANVAS = { W: 800, H: 500 };
const PADDLE = { W: 14, H: 80 };
const BALL_SPEED_INITIAL = 5;
const WIN_SCORE = 5;

export function createInitialState(): GameState {
  return {
    players: [
      { y: CANVAS.H / 2 - PADDLE.H / 2, vy: 0, score: 0 },
      { y: CANVAS.H / 2 - PADDLE.H / 2, vy: 0, score: 0 },
    ],
    ball: {
      x: CANVAS.W / 2, y: CANVAS.H / 2,
      vx: BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1),
      vy: BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1),
    },
    status: 'playing',
  };
}

function resetBall(state: GameState): GameState {
  return {
    ...state,
    ball: {
      x: CANVAS.W / 2, y: CANVAS.H / 2,
      vx: BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1),
      vy: BALL_SPEED_INITIAL * (Math.random() > 0.5 ? 1 : -1),
    },
  };
}

function tickGame(state: GameState): GameState {
  let { players, ball } = state;

  players = players.map(p => ({
    ...p,
    y: Math.max(0, Math.min(CANVAS.H - PADDLE.H, p.y + p.vy)),
  }));

  let { x, y, vx, vy } = ball;
  x += vx;
  y += vy;

  if (y <= 0 || y >= CANVAS.H) vy = -vy;

  const p1 = players[0];
  if (x <= PADDLE.W + 20 && y >= p1.y && y <= p1.y + PADDLE.H) {
    vx = Math.abs(vx) * 1.05;
    vy += (y - (p1.y + PADDLE.H / 2)) * 0.2;
  }

  const p2 = players[1];
  if (x >= CANVAS.W - PADDLE.W - 20 && y >= p2.y && y <= p2.y + PADDLE.H) {
    vx = -Math.abs(vx) * 1.05;
    vy += (y - (p2.y + PADDLE.H / 2)) * 0.2;
  }

  if (x < 0) {
    players[1].score += 1;
    return resetBall({ ...state, players, ball: { x, y, vx, vy } });
  }
  if (x > CANVAS.W) {
    players[0].score += 1;
    return resetBall({ ...state, players, ball: { x, y, vx, vy } });
  }

  const winnerIndex = players.findIndex(p => p.score >= WIN_SCORE);
  if (winnerIndex !== -1) {
    return { ...state, players, ball: { x, y, vx, vy }, status: 'ended', winner: winnerIndex + 1 };
  }

  return { ...state, players, ball: { x, y, vx, vy } };
}

export function startCountdown(room: RoomState) {
  let contagem = 3;

  console.log('Iniciando contagem...');
  broadcast(room, { type: 'starting-game', payload: { countdown: contagem } });

  const intervalo = setInterval(() => {
    contagem--;
    console.log('Contagem:', contagem);

    if (contagem <= 0) {
      clearInterval(intervalo);
      console.log('Enviando started-game');
      broadcast(room, { type: 'started-game' });
      startGameLoop(room);
      return;
    }

    broadcast(room, { type: 'starting-game', payload: { countdown: contagem } });
  }, 1000);
}

export function startGameLoop(room: RoomState) {
  room.loopInterval = setInterval(() => {
    room.gameState = tickGame(room.gameState);
    broadcast(room, { type: 'update-game', payload: room.gameState });

    if (room.gameState.status === 'ended') {
      clearInterval(room.loopInterval);
      broadcast(room, { type: 'end-game', payload: { winner: room.gameState.winner } });
    }
  }, 1000 / 60);
}''