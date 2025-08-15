export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold text-red-400 mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-6">Página não encontrada</p>
        <p className="text-gray-400">A página que você está procurando não existe.</p>
        <a 
          href="/" 
          className="inline-block mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  )
}
