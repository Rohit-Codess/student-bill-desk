import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Students', href: '/students', icon: '👥' },
    { name: 'Fee Types', href: '/fee-types', icon: '💰' },
    { name: 'Generate Fees', href: '/generate-fees', icon: '⚡' },
    { name: 'Assignments', href: '/assignments', icon: '📊' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            {/* Logo and Title */}
            <Link to="/" className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                🎓 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Bill Desk
                </span>
              </h1>
                <span className="text-blue-600 font-medium ml-1">Powered by RTcodeX</span>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center lg:justify-end gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full">
        <div className="transition-all duration-300 ease-in-out">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Student Bill Desk</h3>
              <p className="text-gray-300 text-sm">
                Professional fee management system designed for educational institutions.
              </p>
            </div>

            
            <div className="text-center">
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>✨ Student Management</li>
                <li>💰 Fee Type Configuration</li>
                <li>⚡ Automated Fee Generation</li>
                <li>📊 Comprehensive Reporting</li>
              </ul>
            </div>

            
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-3">Built & Developed by</h4>
              <a 
                href="https://www.rtcodex.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-white font-medium text-sm"
              >
                <span>🚀</span>
                RTcodeX
              </a>
              <p className="text-gray-400 text-xs mt-2">
                Professional Web Development Solutions
              </p>
            </div>
          </div>

          
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 Student Bill Desk. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <span>Built with React + Node.js + MongoDB</span>
              <span>•</span>
              <a 
                href="https://www.rtcodex.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                RTcodeX.dev
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Layout;
