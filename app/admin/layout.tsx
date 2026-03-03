// ============================================
// Admin Layout - Terminal Theme
// ============================================

import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-grid">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-500 text-lg">⚡</span>
            <span className="text-orange-400 font-bold font-mono">ADMIN_PANEL</span>
          </div>
          <p className="text-xs text-cyan-700 font-mono">v0.1.0-alpha</p>
        </div>
        
        <nav className="space-y-1">
          <AdminNavLink href="/admin" icon="◈" exact>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/comparisons" icon="◉">
            Comparisons
          </AdminNavLink>
          <AdminNavLink href="/admin/stats" icon="◊">
            Analytics
          </AdminNavLink>
          <AdminNavLink href="/admin/settings" icon="⚙">
            Settings
          </AdminNavLink>
        </nav>
        
        <div className="mt-8 pt-6 border-t border-cyan-500/20">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-400 transition-colors font-mono"
          >
            <span>←</span>
            <span>Return to Site</span>
          </Link>
        </div>
        
        {/* System Status */}
        <div className="mt-auto pt-6">
          <div className="p-3 rounded border border-cyan-500/20 bg-black/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">SYSTEM_OK</span>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-cyan-700">
                <span>Uptime:</span>
                <span>99.9%</span>
              </div>
              <div className="flex justify-between text-cyan-700">
                <span>Latency:</span>
                <span>&lt;100ms</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Admin Content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

// Admin Navigation Link
function AdminNavLink({
  href,
  children,
  icon,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  icon: string;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded text-sm text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all font-mono"
    >
      <span className="text-cyan-600">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
