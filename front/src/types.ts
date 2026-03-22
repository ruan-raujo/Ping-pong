export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type Player = {
  y: number;
  score: number;
};

export type Room = {
  players: [Player, Player];
  ball: Ball;
  status: 'waiting' | 'countdown' | 'playing' | 'ended';
  winner?: 1 | 2;
  powerUp?: { x: number; y: number; ativo: boolean };
};

export type ServerEvent =
  | { type: 'player-number'; payload: { number: 1 | 2 } }
  | { type: 'all-ready' }
  | { type: 'starting-game'; payload: { countdown: number } }
  | { type: 'started-game' }
  | { type: 'update-game'; payload: Room }
  | { type: 'end-game'; payload: { winner: 1 | 2 } }
  | { type: 'opponent-ready' }
  | { type: 'nomes'; payload: { 1?: string; 2?: string } };

export type ClientEvent =
  | { type: 'join'; payload?: { nome: string } }
  | { type: 'move'; payload: { direction: 'up' | 'down' | 'stop' } };