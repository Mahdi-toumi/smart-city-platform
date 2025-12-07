import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Citizen from './pages/services/Citizen';
import Mobility from './pages/services/Mobility';
import Energy from './pages/services/Energy';
import Emergency from './pages/services/Emergency';
import NotFound from './pages/NotFound';

// 👇 AJOUTE L'IMPORT ICI
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="citizen" element={<Citizen />} />
        <Route path="mobility" element={<Mobility />} />
        <Route path="energy" element={<Energy />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="sos" element={<Emergency />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 👇 PLACE LE TOASTER ICI, JUSTE AVANT LES ROUTES */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
          }}
        />

        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;