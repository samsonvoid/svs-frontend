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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('svs_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Layout = ({ children }) => (
    <div className="bg-[#F3F4F6] h-screen w-full flex overflow-hidden font-sans">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        closeSidebar={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected App Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>} />
        
        {/* Admin Only Routes */}
        <Route path="/purchases" element={<ProtectedRoute><AdminRoute><Layout><Purchases /></Layout></AdminRoute></ProtectedRoute>} />
        <Route path="/stock-logs" element={<ProtectedRoute><AdminRoute><Layout><StockLogs /></Layout></AdminRoute></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><AdminRoute><Layout><Categories /></Layout></AdminRoute></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminRoute><Layout><Settings /></Layout></AdminRoute></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AdminRoute><Layout><Reports /></Layout></AdminRoute></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;