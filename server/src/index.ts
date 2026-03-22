import { Elysia } from 'elysia';
import { joinRoom, handleMove, removeFromRoom, findRoomByWs, broadcast } from './room';
import { startCountdown, createInitialState } from './game';

const app = new Elysia()
  .ws('/websocket', {
    open(ws) {
      const { room, playerNumber } = joinRoom(ws);

      ws.send(JSON.stringify({
        type: 'player-number',
        payload: { number: playerNumber }
      }));

      // Só avisa que estão prontos — NÃO inicia o jogo ainda
      // Espera os dois enviarem 'join' com o nome
      if (room.connections.filter(Boolean).length === 2) {
        broadcast(room, { type: 'all-ready' });
      }
    },

    message(ws, raw) {
      const event = typeof raw === 'string' ? JSON.parse(raw) : raw;

      if (event.type === 'move') {
        handleMove(ws, event.payload.direction);
      }

      if (event.type === 'join') {
        const { room } = findRoomByWs(ws);
        if (!room) return;

        // Salva o nome do jogador
        const playerIndex = room.connections.findIndex(c => c?.id === ws.id);
        if (!room.nomes) room.nomes = {};
        room.nomes[playerIndex + 1] = event.payload?.nome || `Jogador ${playerIndex + 1}`;

        // Transmite os nomes para os dois
        broadcast(room, { type: 'nomes', payload: room.nomes });

        // Avisa o outro que este quer jogar
        room.connections.forEach(c => {
          if (c && c.id !== ws.id) {
            c.send(JSON.stringify({ type: 'opponent-ready' }));
          }
        });

        if (!room.readyPlayers) room.readyPlayers = new Set();
        room.readyPlayers.add(ws.id);

        if (room.readyPlayers.size === 2) {
          room.readyPlayers.clear();
          clearInterval(room.loopInterval); // para loop anterior
          room.gameState = createInitialState();
          broadcast(room, { type: 'all-ready' });
          startCountdown(room);
        }
      }
    },

    close(ws) {
      removeFromRoom(ws);
    }
  })
  .listen(3333);

console.log('Servidor rodando em ws://localhost:3333');