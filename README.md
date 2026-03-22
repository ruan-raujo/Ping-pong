# 🏓 Pong Multiplayer

Jogo de Pong multiplayer em tempo real, onde dois jogadores se conectam cada um no seu navegador e jogam uma partida completa via WebSocket.

Projeto desenvolvido durante um desafio ao vivo no canal da [Codecon](https://www.youtube.com/@codecon).

---

## 🎮 Como jogar

1. Acesse o jogo em dois navegadores ou dispositivos diferentes
2. Digite seu nome e clique em **Jogar partida**
3. Aguarde o segundo jogador conectar
4. Use **W / S** ou **↑ / ↓** para mover sua raquete
5. No celular, use os botões na tela
6. Primeiro a fazer **5 pontos** vence

---

## ✨ Funcionalidades

- Multiplayer em tempo real via WebSocket
- Game loop de 60 FPS sincronizado no servidor
- Power-up de velocidade ⚡ — acelera a bolinha ao ser coletado
- Sons sintéticos via Web Audio API
- Sistema de revanche — jogadores podem reiniciar sem reconectar
- Suporte a mobile com controles touch
- Layout responsivo

---

## 🛠️ Tecnologias

**Frontend**
- React + TypeScript
- Vite
- React Konva (canvas 2D)
- Motion (animações)

**Backend**
- Bun
- Elysia (framework WebSocket)

---

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 20.19+, pnpm, Bun
```bash
# Backend
cd server
bun install
bun run dev

# Frontend (em outro terminal)
cd front
pnpm install
pnpm dev
```

Abra `http://localhost:5173` em duas abas e clique em **Join match** nas duas.

---

## 🏗️ Arquitetura
```
Cliente (Navegador)          Servidor (Bun)
─────────────────            ──────────────
Renderização          ←────  Estado do jogo
Input do jogador      ────→  Física e colisões
WebSocket client      ←────→ WebSocket server
                             Game loop 60 FPS
```

O servidor é a **fonte única de verdade** — toda a física, colisões e pontuação são calculadas no backend e transmitidas aos clientes via WebSocket.

---

## 📁 Estrutura
```
pong-multiplayer/
├── front/
│   └── src/
│       ├── App.tsx       # Estado e WebSocket
│       ├── Game.tsx      # Canvas com Konva
│       ├── Overlay.tsx   # Telas de espera/contagem/vitória
│       └── types.ts      # Tipos compartilhados
└── server/
    └── src/
        ├── index.ts      # Servidor Elysia
        ├── room.ts       # Gerenciamento de salas
        └── game.ts       # Loop, física e colisões
```
