import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text } from 'react-konva';
import type { Room } from './types';

const W = 800, H = 500;
const PADDLE = { W: 14, H: 80 };

type Props = {
  state: Room;
  playerNumber: 1 | 2 | null;
  nomes: { 1?: string; 2?: string };
  onMove: (dir: 'up' | 'down' | 'stop') => void;
};

type ControlesProps = {
  onMove: (dir: 'up' | 'down' | 'stop') => void;
};

function ControlesMobile({ onMove }: ControlesProps) {
  useEffect(() => {
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    return () => document.removeEventListener('touchmove', e => e.preventDefault());
  }, []);

  const btnStyle = {
    width: 80, height: 80,
    fontSize: 36,
    background: '#ffffff15',
    border: '2px solid #ffffff33',
    borderRadius: 16,
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    touchAction: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'fixed',
      bottom: 40,
      right: 24,
      zIndex: 999,
    }}>
      <button
        style={btnStyle}
        onPointerDown={() => onMove('up')}
        onPointerUp={() => onMove('stop')}
        onPointerLeave={() => onMove('stop')}
      >
        ▲
      </button>
      <button
        style={btnStyle}
        onPointerDown={() => onMove('down')}
        onPointerUp={() => onMove('stop')}
        onPointerLeave={() => onMove('stop')}
      >
        ▼
      </button>
    </div>
  );
}

function useEscala() {
  const [escala, setEscala] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function atualizar() {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      const escalaX = window.innerWidth / W;
      const escalaY = window.innerHeight / H;
      setEscala(Math.min(escalaX, escalaY, 1));
    }

    atualizar();
    window.addEventListener('resize', atualizar);
    return () => window.removeEventListener('resize', atualizar);
  }, []);

  return { escala, isMobile };
}

export function Game({ state, playerNumber, nomes, onMove }: Props) {
  const [p1, p2] = state.players;
  const ball = state.ball;
  const powerUp = state.powerUp;
  const { escala, isMobile } = useEscala();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
    }}>
      <div style={{
        transform: `scale(${escala})`,
        transformOrigin: 'center center',
      }}>
        <Stage width={W} height={H}>
          <Layer>
            <Rect x={0} y={0} width={W} height={H} fill="#050510" />
            <Line points={[W / 2, 0, W / 2, H]} stroke="#ffffff22" strokeWidth={2} dash={[12, 12]} />

            {/* Placar */}
            <Text text={String(p1.score)} x={W / 2 - 80} y={24} fontSize={48} fill="#ffffff66" fontFamily="monospace" />
            <Text text={String(p2.score)} x={W / 2 + 40} y={24} fontSize={48} fill="#ffffff66" fontFamily="monospace" />

            {/* Nomes */}
            <Text
              text={nomes[1] || 'Jogador 1'}
              x={10} y={H - 28}
              fontSize={14}
              fill={playerNumber === 1 ? '#00ff88' : '#ffffff88'}
              fontFamily="monospace"
            />
            <Text
              text={nomes[2] || 'Jogador 2'}
              x={W - 100} y={H - 28}
              fontSize={14}
              fill={playerNumber === 2 ? '#00e5ff' : '#ffffff88'}
              fontFamily="monospace"
            />

            {/* Power-up */}
            {powerUp?.ativo && (
              <>
                <Circle
                  x={powerUp.x} y={powerUp.y}
                  radius={14}
                  fill="#ffdd00"
                  shadowColor="#ffdd00"
                  shadowBlur={20}
                />
                <Text
                  text="⚡"
                  x={powerUp.x - 8} y={powerUp.y - 8}
                  fontSize={16}
                />
              </>
            )}

            {/* Raquete jogador 1 */}
            <Rect
              x={20} y={p1.y}
              width={PADDLE.W} height={PADDLE.H}
              fill={playerNumber === 1 ? '#00ff88' : '#ffffff'}
              cornerRadius={4}
              shadowColor={playerNumber === 1 ? '#00ff88' : 'transparent'}
              shadowBlur={playerNumber === 1 ? 14 : 0}
            />

            {/* Raquete jogador 2 */}
            <Rect
              x={W - 20 - PADDLE.W} y={p2.y}
              width={PADDLE.W} height={PADDLE.H}
              fill={playerNumber === 2 ? '#00e5ff' : '#ffffff'}
              cornerRadius={4}
              shadowColor={playerNumber === 2 ? '#00e5ff' : 'transparent'}
              shadowBlur={playerNumber === 2 ? 14 : 0}
            />

            {/* Bolinha */}
            <Circle
              x={ball.x} y={ball.y}
              radius={8}
              fill="#ffffff"
              shadowColor="#ffffff"
              shadowBlur={18}
            />
          </Layer>
        </Stage>
      </div>

      {/* Botões só aparecem no mobile */}
      {isMobile && <ControlesMobile onMove={onMove} />}
    </div>
  );
}