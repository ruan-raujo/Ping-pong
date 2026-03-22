import { useState, useEffect, useRef } from 'react';
import { Game } from './Game.tsx';
import { Overlay } from './Overlay.tsx';
import type { Room, ServerEvent } from './types';

const WS_URL = 'wss://ping-pong-production-b5c0.up.railway.app/websocket';

function criarSons(ctx: AudioContext) {
  function playBeep(frequency: number, duration: number, volume = 0.3) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'square';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  return {
    _ctx: ctx,
    rebatida: () => playBeep(440, 0.05, 0.4),
    ponto: () => {
      playBeep(220, 0.3, 0.5);
      setTimeout(() => playBeep(180, 0.3, 0.4), 150);
    },
    contagem: () => playBeep(660, 0.1, 0.3),
    inicio: () => {
      playBeep(440, 0.1, 0.3);
      setTimeout(() => playBeep(550, 0.1, 0.3), 120);
      setTimeout(() => playBeep(660, 0.2, 0.4), 240);
    },
    powerUp: () => {
      playBeep(880, 0.05, 0.4);
      setTimeout(() => playBeep(1100, 0.1, 0.5), 60);
    },
  };
}

export default function App() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'waiting' | 'countdown' | 'playing' | 'ended'>('idle');
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [gameState, setGameState] = useState<Room | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const [nomes, setNomes] = useState<{ 1?: string; 2?: string }>({});
  const [meuNome, setMeuNome] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const sons = useRef<ReturnType<typeof criarSons> | null>(null);
  const gameStateRef = useRef<Room | null>(null);

  // Cria AudioContext na primeira interação
  useEffect(() => {
    const criarContexto = () => {
      if (!sons.current) {
        const ctx = new AudioContext();
        ctx.resume();
        sons.current = criarSons(ctx);
      }
      window.removeEventListener('click', criarContexto);
      window.removeEventListener('keydown', criarContexto);
    };

    window.addEventListener('click', criarContexto);
    window.addEventListener('keydown', criarContexto);

    return () => {
      window.removeEventListener('click', criarContexto);
      window.removeEventListener('keydown', criarContexto);
    };
  }, []);

  // Captura teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      if (e.target instanceof HTMLInputElement) return;

      const dir = e.key === 'w' || e.key === 'ArrowUp' ? 'up'
                : e.key === 's' || e.key === 'ArrowDown' ? 'down'
                : null;
      if (!dir) return;
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'move',
          payload: { direction: isDown ? dir : 'stop' }
        }));
      }
    };

    window.addEventListener('keydown', e => handleKey(e, true));
    window.addEventListener('keyup', e => handleKey(e, false));
    return () => {
      window.removeEventListener('keydown', e => handleKey(e, true));
      window.removeEventListener('keyup', e => handleKey(e, false));
    };
  }, []);

  const conectar = (nome: string) => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({
        type: 'join',
        payload: { nome }
      }));
    };

    ws.current.onmessage = (e) => {
      const event: ServerEvent = JSON.parse(e.data);

      switch (event.type) {
        case 'player-number':
          setPlayerNumber(event.payload.number);
          setGameStatus('waiting');
          break;
        case 'all-ready':
          setOpponentReady(false);
          setWinner(null);
          setGameStatus('countdown');
          break;
        case 'starting-game':
          setCountdown(event.payload.countdown);
          sons.current?.contagem();
          break;
        case 'started-game':
          setWinner(null);
          setGameStatus('playing');
          sons.current?.inicio();
          break;
        case 'update-game':
          const prev = gameStateRef.current;
          if (prev) {
            const bateu =
              (event.payload.ball.vx > 0 && prev.ball.vx < 0) ||
              (event.payload.ball.vx < 0 && prev.ball.vx > 0);
            if (bateu) sons.current?.rebatida();

            const pontuou =
              event.payload.players[0].score !== prev.players[0].score ||
              event.payload.players[1].score !== prev.players[1].score;
            if (pontuou) sons.current?.ponto();

            const pegouPowerUp = prev.powerUp?.ativo && !event.payload.powerUp?.ativo;
            if (pegouPowerUp) sons.current?.powerUp();
          }
          gameStateRef.current = event.payload;
          setGameState(event.payload);
          break;
        case 'end-game':
          setWinner(event.payload.winner);
          setGameStatus('ended');
          setOpponentReady(false);
          setGameState(null);
          gameStateRef.current = null;
          break;
        case 'opponent-ready':
          setOpponentReady(true);
          break;
        case 'nomes':
          setNomes(event.payload);
          break;
      }
    };
  };

  const handleMove = (dir: 'up' | 'down' | 'stop') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'move',
        payload: { direction: dir }
      }));
    }
  };

  const handleJoin = (nome: string) => {
    if (nome) setMeuNome(nome);
    setOpponentReady(false);
    setCountdown(3);

    const nomeFinal = nome || meuNome || `Jogador ${playerNumber}`;

    // Na revanche, WebSocket já está aberto — só envia o join
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'join',
        payload: { nome: nomeFinal }
      }));
    } else {
      // Primeira vez — conecta e envia no onopen
      conectar(nomeFinal);
    }
  };

  return (
    <div className="app">
      {gameStatus === 'playing' && gameState ? (
        <Game
          state={gameState}
          playerNumber={playerNumber}
          nomes={nomes}
          onMove={handleMove}
        />
      ) : (
        <Overlay
          status={gameStatus}
          countdown={countdown}
          winner={winner}
          playerNumber={playerNumber}
          onJoin={handleJoin}
          opponentReady={opponentReady}
          nomes={nomes}
        />
      )}
    </div>
  );
}