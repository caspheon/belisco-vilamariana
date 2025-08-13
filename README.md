# Sinu Cado Belisco

Sistema de gerenciamento de jogadores e partidas para o jogo Sinu Cado Belisco.

## 🚀 Deploy no Vercel

Esta aplicação está configurada para deploy automático no Vercel.

### Deploy Automático
1. Conecte seu repositório GitHub ao Vercel
2. O Vercel detectará automaticamente que é uma aplicação Next.js
3. Cada push para a branch principal gerará um novo deploy

### Deploy Manual
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

## 🗄️ Banco de Dados Neon

A aplicação usa o **Neon** (PostgreSQL serverless) para persistência de dados.

### Configuração do Banco

1. **Copie as variáveis de ambiente:**
```bash
cp env.example .env.local
```

2. **Configure a DATABASE_URL** no arquivo `.env.local` com sua string de conexão do Neon

3. **Execute o setup do banco:**
```bash
npm run db:setup
```

### Scripts do Banco de Dados

```bash
# Configurar banco (criar tabelas)
npm run db:setup

# Resetar banco (remover tudo)
npm run db:reset

# Inserir dados de exemplo
npm run db:seed
```

### Estrutura do Banco

- **`players`** - Jogadores cadastrados
- **`matches`** - Partidas agendadas
- **`match_participants`** - Participantes das partidas
- **`match_results`** - Resultados das partidas
- **`player_stats`** - Estatísticas dos jogadores

## 📋 Requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Neon (PostgreSQL serverless)

## 🛠️ Instalação Local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd sinucadobelisco
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
```bash
cp env.example .env.local
# Edite .env.local com sua DATABASE_URL do Neon
npm run db:setup
npm run db:seed
```

## 🏃‍♂️ Executando a aplicação

### Modo de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para produção
```bash
npm run build
npm start
```

## 🏗️ Estrutura do projeto

- `app/` - Páginas e layout da aplicação Next.js (App Router)
- `components/` - Componentes React reutilizáveis
- `components/ui/` - Componentes de interface baseados em Radix UI
- `lib/` - Utilitários e funções auxiliares
- `database/` - Schema SQL e configurações do banco
- `scripts/` - Scripts para manutenção do banco
- `vercel.json` - Configurações específicas para Vercel

## 🛠️ Tecnologias utilizadas

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes de interface acessíveis
- **Lucide React** - Ícones SVG
- **Neon** - PostgreSQL serverless
- **Vercel** - Deploy e hospedagem

## ✨ Funcionalidades

- Gerenciamento de jogadores
- Criação de partidas
- Sistema de ranking
- Interface responsiva e moderna
- Deploy automático no Vercel
- Banco de dados PostgreSQL serverless
- Estatísticas automáticas dos jogadores

## 🌐 URLs de Deploy

- **Produção**: [sua-app.vercel.app](https://sua-app.vercel.app)
- **Preview**: [sua-app-git-main.vercel.app](https://sua-app-git-main.vercel.app)

## 📝 Notas de Deploy

- A aplicação usa o modo `standalone` para otimização no Vercel
- Região configurada para Brasil (gru1) para melhor performance
- Build otimizado com cache automático
- Deploy automático a cada push para a branch principal
- Banco de dados Neon configurado para produção

## 🔧 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
DATABASE_URL="sua_string_de_conexao_neon"
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Produção (Vercel Dashboard)
```env
DATABASE_URL="sua_string_de_conexao_neon_producao"
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sua-app.vercel.app
```
