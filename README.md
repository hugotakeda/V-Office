<div align="center">
  <img src="./client/src/app/icon.svg" alt="V-Office Logo" width="120" />
  <h1>V-Office</h1>
  <p><b>O escritório virtual 3D que conecta equipes remotas em tempo real.</b></p>
</div>

---

O V-Office é uma plataforma interativa 3D projetada para revolucionar o trabalho remoto. Com um design elegante de planta baixa (blueprint), o sistema oferece alocação dinâmica de cúbiculos, chat global via WebSockets, painel de "Bate-Ponto" e videoconferências perfeitamente integradas via Jitsi. Uma experiência colaborativa instantânea e sem limites de tempo.

## ✨ Funcionalidades

- **🗺️ Planta Baixa 3D**: Navegue por um escritório virtual renderizado em WebGL com design arquitetônico em Modo Escuro.
- **🎥 Chamadas de Vídeo Integradas**: Reuniões em vídeo instantâneas dentro do próprio app, alimentadas pelo Jitsi Meet (sem limite de tempo).
- **🔒 Autenticação OAuth**: Login seguro utilizando contas do **GitHub** ou **Google**.
- **💬 Chat Global em Tempo Real**: Converse com toda a equipe do escritório instantaneamente usando WebSockets.
- **⏱️ Sistema de Ponto (Dashboard)**: Acompanhe de forma automática o seu tempo trabalhado no dia e o seu histórico de permanência em cada sala.
- **👥 Cúbiculos e Salas de Reunião**: Ocupe cúbiculos individuais ou reúna o time inteiro na Sala de Reunião ou Copa.

## 🛠️ Tecnologias Utilizadas

Este projeto é um *Monorepo* dividido em Front-End (Client) e Back-End (Server).

### Frontend (`/client`)
- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **3D Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Estilização**: Tailwind CSS + CSS Puro (Glassmorphism)
- **Autenticação**: [NextAuth.js](https://next-auth.js.org/)
- **Videoconferência**: [Jitsi Meet API](https://jitsi.org/api/)

### Backend (`/server`)
- **Servidor**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Tempo Real**: [Socket.IO](https://socket.io/)
- **Banco de Dados**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))

---

## 🚀 Como rodar o projeto localmente

### 1. Clonando o Repositório
```bash
git clone https://github.com/hugotakeda/V-Office.git
cd V-Office
```

### 2. Configurando o Backend (Server)
Abra um terminal e entre na pasta do servidor:
```bash
cd server
npm install
npm run dev
```
> O servidor Socket.IO irá rodar na porta `3001` e o Prisma irá criar/atualizar automaticamente o banco SQLite.

### 3. Configurando o Frontend (Client)
Abra outro terminal na raiz do projeto e vá para a pasta do cliente:
```bash
cd client
npm install
```

Crie um arquivo chamado `.env.local` dentro da pasta `client` com as chaves OAuth (você pode gerar no Google Cloud e no GitHub Developer Settings):
```env
# URL Base
NEXTAUTH_URL=http://localhost:3000

# Chave secreta de sessão (Pode gerar usando: openssl rand -base64 32)
NEXTAUTH_SECRET=sua_chave_super_secreta_aqui

# GitHub OAuth
GITHUB_ID=seu_client_id_do_github
GITHUB_SECRET=seu_client_secret_do_github

# Google OAuth
GOOGLE_ID=seu_client_id_do_google
GOOGLE_SECRET=seu_client_secret_do_google
```

Após configurar o `.env.local`, inicie a interface:
```bash
npm run dev
```
> Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📸 Identidade Visual

O projeto possui um estilo predominante "Blueprint" (Planta Baixa) arquitetônico. O ícone principal (SVG) encontra-se em `client/src/app/icon.svg` e é automaticamente incorporado pelo Next.js.

## 📄 Licença

Distribuído sob a licença MIT. Desenvolvido por Hugo Takeda.
