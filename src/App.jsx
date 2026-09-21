import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import StockLogs from './pages/StockLogs';
import Login from './pages/Login';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Basic layout wrapper for auth'd routes
  const Layout = ({ children }) => (
      <div className="bg-[#F3F4F6] h-screen flex overflow-hidden font-sans">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>
      </div>
  );

  const requireAuth = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
    if (!user || !user.id) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Main App Routes */}
        <Route path="/" element={<Layout><requireAuth><Dashboard /></requireAuth></Layout>} />
        <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
        <Route path="/sales" element={<Layout><Sales /></Layout>} />
        
        {/* Admin Only Routes */}
        <Route path="/purchases" element={<AdminRoute><Layout><Purchases /></Layout></AdminRoute>} />
        <Route path="/stock-logs" element={<AdminRoute><Layout><StockLogs /></Layout></AdminRoute>} />
        <Route path="/categories" element={<AdminRoute><Layout><Categories /></Layout></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Layout><Settings /></Layout></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Layout><Reports /></Layout></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;