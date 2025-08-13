# Configuração do Vercel para Deploy

## Problema Resolvido ✅
- Removidas as referências incorretas ao segredo `@database_url` no `vercel.json`
- Corrigido o script duplicado `vercel-build` no `package.json`
- Configuração otimizada para deploy no Vercel

## Passos para Configurar a Variável de Ambiente

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

## Estrutura da String de Conexão Neon

```
postgresql://[username]:[password]@[hostname]:[port]/[database]?sslmode=require
```

### Exemplo:
```
postgresql://john_doe:mypassword123@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Verificação

Após configurar a variável de ambiente, o deploy deve funcionar corretamente. O script `vercel-build` irá:

1. ✅ Verificar a conexão com o banco de dados
2. ✅ Executar o build do Next.js
3. ✅ Deployar a aplicação

## Troubleshooting

Se ainda houver problemas:

1. **Verifique se a variável está configurada corretamente**
2. **Confirme se a string de conexão do Neon está válida**
3. **Teste a conexão localmente primeiro**
4. **Verifique os logs de deploy no Vercel**

## Comandos Úteis

```bash
# Verificar conexão local
npm run db:check

# Build local
npm run build

# Deploy manual (se necessário)
vercel --prod
```
