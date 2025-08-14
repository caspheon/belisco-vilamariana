# Configuração do Vercel para Deploy - Sinu Cado Belisco

## ✅ Sistema Atualizado

O sistema foi completamente refatorado para funcionar com banco de dados Neon:

- **Jogadores**: Apenas nome (sem email/telefone)
- **Partidas**: Sistema simples 1v1 (individual)
- **Estatísticas**: Vitórias, derrotas e total de partidas calculadas automaticamente
- **Banco de dados**: Neon PostgreSQL com schema otimizado

## 🔧 Problemas Resolvidos

- ❌ Referências incorretas a segredos inexistentes
- ❌ Scripts duplicados no package.json
- ❌ Sistema complexo desnecessário
- ✅ Configuração limpa e funcional para deploy
- ✅ Schema de banco simplificado e eficiente

## 📋 Passos para Configurar a Variável de Ambiente

### 1. Acesse o Dashboard do Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login na sua conta
- Selecione o projeto `belisco-vilamariana`

### 2. Configure a Variável de Ambiente
- Clique em **Settings** (Configurações)
- Vá para **Environment Variables** (Variáveis de Ambiente)
- Clique em **Add New** (Adicionar Nova)

### 3. Adicione a Variável DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Cole sua string de conexão do Neon Database
  - Exemplo: `postgresql://username:password@hostname:port/database?sslmode=require`
- **Environment**: Selecione todas as opções:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

### 4. Salve e Redeply
- Clique em **Save** (Salvar)
- Vá para **Deployments** (Implantações)
- Clique em **Redeploy** na sua implantação mais recente

## 🗄️ Estrutura da String de Conexão Neon

```
postgresql://[username]:[password]@[hostname]:[port]/[database]?sslmode=require
```

### Exemplo:
```
postgresql://john_doe:mypassword123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🎯 Como o Sistema Funciona Agora

### 1. **Adicionar Jogador**
- Usuário digita apenas o nome
- Sistema valida se já existe
- Jogador é salvo no banco

### 2. **Criar Partida**
- Seleciona 2 jogadores
- Define quem ganhou
- Sistema salva automaticamente:
  - Partida
  - Participantes
  - Resultados (1º = vencedor, 2º = perdedor)

### 3. **Estatísticas Automáticas**
- Número de partidas
- Número de vitórias
- Número de derrotas
- Rating calculado automaticamente

## 🔍 Verificação

Após configurar a variável de ambiente, o deploy deve funcionar corretamente. O script `vercel-build` irá:

1. ✅ Configurar o banco de dados automaticamente
2. ✅ Criar todas as tabelas necessárias
3. ✅ Inserir jogadores de exemplo
4. ✅ Executar o build do Next.js
5. ✅ Deployar a aplicação

## 🚀 Comandos Úteis

```bash
# Verificar conexão local
npm run db:check

# Setup local do banco
npm run db:setup-vercel

# Build local
npm run build

# Deploy manual (se necessário)
vercel --prod
```

## 🆘 Troubleshooting

Se ainda houver problemas:

1. **Verifique se a variável está configurada corretamente**
2. **Confirme se a string de conexão do Neon está válida**
3. **Teste a conexão localmente primeiro**
4. **Verifique os logs de deploy no Vercel**
5. **Confirme se o banco Neon está ativo**

## 📱 Funcionalidades do Sistema

- **Gestão de Jogadores**: Adicionar apenas com nome
- **Partidas 1v1**: Sistema simples e direto
- **Ranking Automático**: Baseado em vitórias e rating
- **Estatísticas em Tempo Real**: Atualizadas automaticamente
- **Interface Responsiva**: Funciona em desktop e mobile

O sistema agora está otimizado para uso real com banco de dados persistente! 🎉
