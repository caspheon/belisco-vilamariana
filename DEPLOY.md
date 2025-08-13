# 🚀 Deploy no Vercel - Sinu Cado Belisco

## 📋 Pré-requisitos

1. **Conta no Vercel** - [vercel.com](https://vercel.com)
2. **Banco Neon PostgreSQL** - [neon.tech](https://neon.tech)
3. **GitHub conectado ao Vercel**

## 🔧 Configuração do Banco de Dados

### 1. Criar banco no Neon
- Acesse [neon.tech](https://neon.tech)
- Crie um novo projeto
- Copie a string de conexão (DATABASE_URL)

### 2. Executar Schema do Banco
```bash
# Conectar ao banco e executar o schema
psql "sua_string_de_conexao_neon"
# Cole o conteúdo de database/schema.sql
```

## 🚀 Deploy no Vercel

### 1. Conectar Repositório
- No Vercel, clique em "New Project"
- Importe seu repositório do GitHub
- Configure como projeto Next.js

### 2. Configurar Variáveis de Ambiente
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
DATABASE_URL = sua_string_de_conexao_neon
```

### 3. Configurar Build Command
O projeto já está configurado para usar:
```bash
npm run vercel-build
```

Este comando:
- Verifica a conexão com o banco
- Executa o build do Next.js

### 4. Deploy
- Clique em "Deploy"
- Aguarde o build e deploy

## 🔍 Verificações Pós-Deploy

### 1. Testar Conexão com Banco
```bash
# No terminal do Vercel ou localmente
npm run db:check
```

### 2. Verificar Logs
- No painel do Vercel, vá em **Functions**
- Verifique se não há erros de conexão

## 🐛 Troubleshooting

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Confirme se o banco Neon está ativo
- Verifique se o IP do Vercel está liberado (se necessário)

### Erro de Build
- Verifique os logs do build
- Confirme se todas as dependências estão no `package.json`
- Teste localmente com `npm run build`

### Erro de Runtime
- Verifique os logs das funções no Vercel
- Confirme se as variáveis de ambiente estão disponíveis

## 📱 URLs Importantes

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Neon Dashboard**: [console.neon.tech](https://console.neon.tech)
- **Documentação Vercel**: [vercel.com/docs](https://vercel.com/docs)

## 🔒 Segurança

- Nunca commite arquivos `.env` no Git
- Use variáveis de ambiente do Vercel
- Configure CORS se necessário
- Monitore logs regularmente

## 📊 Monitoramento

- Configure alertas no Vercel
- Monitore performance do banco Neon
- Use Vercel Analytics para métricas
