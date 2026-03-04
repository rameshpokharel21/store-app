

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Dashboard from "./pages/Dashboard";
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import ManagerPage from './pages/ManagerPage';


function App() {
  
  
  return (
   <BrowserRouter>
    <Routes>
      {/*Public routes*/}
      <Route
        path="/login"
        element={<Login />}
      />

      {/*protected routes*/}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
      />

      <Route
        path="/admin"
        element={<RoleBasedRoute allowedRoles={["ADMIN"]}>
            <AdminPanel />
        </RoleBasedRoute>}
      />

      <Route
        path="/manager"
        element={
          <RoleBasedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerPage />
          </RoleBasedRoute>
        }
      />

      {/*Default Route*/}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className='text-center'>
              <h1 className='text-6xl font-bold text-gray-800 mb-4'>404</h1>
              <p className='text-xl text-gray-600 mb-8'>Page not found</p>
              <a
                href="/dashboard"
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block'
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
   </BrowserRouter>
  )
}

export default App
