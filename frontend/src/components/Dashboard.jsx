export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Fenmo
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">
              Welcome, <span className="font-medium text-white">{user?.name}</span>
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to your Dashboard
          </h2>
          <p className="text-slate-400">
            Start tracking your expenses and manage your finances.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Balance</p>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No expenses yet</h3>
          <p className="text-slate-400 mb-6">Start by adding your first expense to track your spending.</p>
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 shadow-lg shadow-cyan-500/25">
            Add Expense
          </button>
        </div>
      </main>
    </div>
  );
}

