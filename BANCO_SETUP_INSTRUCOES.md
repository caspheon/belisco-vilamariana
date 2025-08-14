# 🗄️ Configuração do Banco de Dados - Passo a Passo

## 🚀 **Opção 1: Executar Localmente (Recomendado)**

### **1. Configure a variável de ambiente localmente:**
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
DATABASE_URL="postgresql://seu_usuario:sua_senha@seu_host/neondb?sslmode=require"
```

**Exemplo real:**
```bash
DATABASE_URL="postgresql://neondb_owner:npg_sMVTAgR6W5ez@ep-blue-sun-af0u6ffk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### **2. Execute o setup do banco:**
```bash
npm run db:setup-vercel
```

### **3. Verifique se está funcionando:**
```bash
npm run db:check
```

## 🌐 **Opção 2: Executar no Vercel (Após Deploy)**

### **1. Configure a variável no Vercel:**
1. Acesse o dashboard do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione: `DATABASE_URL` com sua string de conexão Neon

### **2. Execute via Vercel Functions:**
Crie uma API route temporária para executar o setup:

```typescript
// app/api/setup-db/route.ts
import { NextResponse } from 'next/server'
import { setupDatabase } from '../../../scripts/setup-db-vercel'

export async function POST() {
  try {
    await setupDatabase()
    return NextResponse.json({ success: true, message: 'Banco configurado com sucesso!' })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
```

### **3. Acesse a rota para executar:**
```
POST /api/setup-db
```

## 🔧 **Opção 3: Executar via Vercel CLI**

### **1. Instale o Vercel CLI:**
```bash
npm i -g vercel
```

### **2. Faça login:**
```bash
vercel login
```

### **3. Execute o comando:**
```bash
vercel env pull .env.local
vercel env add DATABASE_URL
npm run db:setup-vercel
```

## 📋 **Comandos Disponíveis:**

```bash
# Setup do banco (cria estrutura)
npm run db:setup-vercel

# Reset completo (remove tudo e recria)
npm run db:fresh-vercel

# Apenas reset (remove tudo)
npm run db:reset-vercel

# Verificar status
npm run db:check
```

## 🎯 **Recomendação:**

**Use a Opção 1 (local)** porque:
- ✅ **Mais rápido** e direto
- ✅ **Sem problemas** de timeout do Vercel
- ✅ **Debug mais fácil** se houver erros
- ✅ **Controle total** do processo

## 🚨 **IMPORTANTE:**

1. **Nunca commite** o arquivo `.env.local`
2. **Use a string de conexão real** do seu banco Neon
3. **Execute o setup localmente** primeiro para testar
4. **Depois configure** no Vercel para produção

## 🎉 **Resultado Esperado:**

Após o setup:
- ✅ **Tabelas criadas** no banco Neon
- ✅ **Função `get_player_stats`** criada
- ✅ **Sistema funcionando** completamente
- ✅ **Jogadores e partidas** funcionando

**Execute o setup localmente primeiro para garantir que tudo está funcionando!** 🚀
