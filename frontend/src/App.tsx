import { useState } from 'react'
import StudentManager from './components/StudentManager'
import FeeTypeManager from './components/FeeTypeManager'
import FeeGenerator from './components/FeeGenerator'
import FeeAssignments from './components/FeeAssignments'

function App() {
  const [activeTab, setActiveTab] = useState('students')

  const tabs = [
    { id: 'students', label: 'Students', icon: '👥', component: <StudentManager /> },
    { id: 'feetypes', label: 'Fee Types', icon: '💰', component: <FeeTypeManager /> },
    { id: 'generate', label: 'Generate Fees', icon: '⚡', component: <FeeGenerator /> },
    { id: 'assignments', label: 'Fee Assignments', icon: '📊', component: <FeeAssignments /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            {/* Logo and Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                🎓 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Student Bill Desk
                </span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive Fee Management System | 
                <span className="text-blue-600 font-medium ml-1">Powered by RTcodeX</span>
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap justify-center lg:justify-end gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow to fill available space */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="transition-all duration-300 ease-in-out">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </main>

      {/* Footer - Always at bottom */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Student Bill Desk</h3>
              <p className="text-gray-300 text-sm">
                Professional fee management system designed for educational institutions.
              </p>
            </div>

            {/* Features Section */}
            <div className="text-center">
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>✨ Student Management</li>
                <li>💰 Fee Type Configuration</li>
                <li>⚡ Automated Fee Generation</li>
                <li>📊 Comprehensive Reporting</li>
              </ul>
            </div>

            {/* RTcodeX Section */}
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

          {/* Bottom Bar */}
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
      </footer>
    </div>
  )
}

export default App
