const { testConnection } = require('../lib/db-config.js');

async function main() {
  console.log('🔍 Verificando conexão com banco de dados...');
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Banco de dados funcionando perfeitamente!');
      process.exit(0);
    } else {
      console.log('❌ Falha na conexão com banco de dados');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  }
}

main();
