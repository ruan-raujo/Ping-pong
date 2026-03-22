import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  status: string;
  countdown: number;
  winner: 1 | 2 | null;
  playerNumber: 1 | 2 | null;
  onJoin: (nome: string) => void;
  opponentReady: boolean;
  nomes: { 1?: string; 2?: string };
};

export function Overlay({ status, countdown, winner, playerNumber, onJoin, opponentReady, nomes }: Props) {
  const [nome, setNome] = useState('');

  const nomeVencedor = winner ? nomes[winner] || `Jogador ${winner}` : '';
  const euVenci = winner === playerNumber;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, color: 'white', fontFamily: 'monospace' }}>
      <AnimatePresence mode="wait">

        {status === 'idle' && (
          <motion.div key="idle"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h1 style={{ fontSize: 80, letterSpacing: 16 }}>PONG</h1>
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && nome.trim() && onJoin(nome.trim())}
              maxLength={12}
              style={{
                padding: '10px 20px', fontSize: 18, background: 'transparent',
                border: '2px solid #ffffff44', borderRadius: 8, color: 'white',
                fontFamily: 'monospace', textAlign: 'center', outline: 'none'
              }}
            />
            <button
              onClick={() => nome.trim() && onJoin(nome.trim())}
              disabled={!nome.trim()}
              style={{
                padding: '12px 32px', fontSize: 18,
                background: nome.trim() ? '#00ff88' : '#ffffff22',
                color: nome.trim() ? '#050510' : '#ffffff44',
                border: 'none', borderRadius: 8,
                cursor: nome.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'monospace', fontWeight: 'bold', transition: 'all 0.2s'
              }}>
              Jogar partida
            </button>
          </motion.div>
        )}

        {status === 'waiting' && !opponentReady && (
          <motion.div key="waiting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 24 }}>Você é o Jogador {playerNumber}</p>
            <p style={{ color: '#ffffff88' }}>Esperando segundo jogador...</p>
          </motion.div>
        )}

        {status === 'countdown' && (
          <motion.div key={countdown}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}>
            <span style={{ fontSize: 120, fontWeight: 'bold' }}>{countdown}</span>
          </motion.div>
        )}

        {status === 'ended' && !opponentReady && (
          <motion.div key="ended"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 48 }}>
              {euVenci ? '🏆 Você venceu!' : '💀 Você perdeu!'}
            </h2>
            <p style={{ color: '#ffffff88', fontSize: 18 }}>
              {euVenci ? 'Parabéns!' : `${nomeVencedor} venceu!`}
            </p>
            <button onClick={() => onJoin(nome || `Jogador ${playerNumber}`)}
              style={{ padding: '12px 32px', fontSize: 18, background: '#00e5ff', color: '#050510', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>
              Jogar novamente
            </button>
          </motion.div>
        )}

        {status === 'ended' && opponentReady && (
          <motion.div key="waiting-opponent"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 48 }}>
              {euVenci ? '🏆 Você venceu!' : '💀 Você perdeu!'}
            </h2>
            <p style={{ fontSize: 20, color: '#00ff88' }}>
              {nomes[playerNumber === 1 ? 2 : 1] || 'Oponente'} quer uma revanche!
            </p>
            <button onClick={() => onJoin(nome || `Jogador ${playerNumber}`)}
              style={{ padding: '12px 32px', fontSize: 18, background: '#00ff88', color: '#050510', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' }}>
              Aceitar revanche!
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}