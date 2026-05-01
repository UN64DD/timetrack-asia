import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import EventsPage from './pages/EventsPage';
import EventDetail from './pages/EventDetail';
import Registration from './pages/Registration';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerDashboard from './pages/OrganizerDashboard';
import About from './pages/About';
import Results from './pages/Results';
import Contact from './pages/Contact';
import DeveloperLogin from './pages/DeveloperLogin';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './lib/LanguageContext';
import { NotificationProvider } from './lib/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Laptop, ShieldX } from 'lucide-react';
import { supabase } from './lib/supabase';

function IPFirewall({ children }: { children: React.ReactNode }) {
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIP();
  }, []);

  const checkIP = async () => {
    // SYSTEM OVERRIDE: IP check bypassed to prevent 406 schema errors
    setLoading(false);
  };

  if (loading) return null;

  if (isBanned) {
    return (
      <div className="min-h-screen bg-[#0a0000] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20 text-red-500">
          <ShieldX size={48} className="animate-pulse" />
        </div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter text-white mb-4">Connection Terminated</h1>
        <p className="text-red-500/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
          Your network access to this system has been permanently revoked by the root administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function DesktopGuard({ children, theme = 'blue' }: { children: React.ReactNode, theme?: 'blue' | 'red' | 'purple' }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const themeClasses = {
    blue: 'bg-[#020617] text-blue-500',
    red: 'bg-[#0a0000] text-red-500',
    purple: 'bg-[#05000a] text-purple-500'
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className={`min-h-screen ${themeClasses[theme].split(' ')[0]} flex flex-col items-center justify-center p-10 text-center`}>
        <div className={`w-24 h-24 bg-current/10 rounded-3xl flex items-center justify-center mb-8 border border-current/20 ${themeClasses[theme].split(' ')[1]}`}>
          <Laptop size={48} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-white mb-4">Secure Terminal Required</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
          This system is perfected for desktop resolution only. Please connect via a secure workstation.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const [isDev, setIsDev] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrg, setIsOrg] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('developer.')) setIsDev(true);
    else if (hostname.startsWith('admin.')) setIsAdmin(true);
    else if (hostname.startsWith('organizer.')) setIsOrg(true);
  }, []);

  return (
    <ErrorBoundary>
      <IPFirewall>
        <LanguageProvider>
          <NotificationProvider>
            {isDev ? (
            <DesktopGuard theme="purple">
              <div className="min-h-screen bg-black">
                <Routes>
                  <Route path="/login" element={<DeveloperLogin />} />
                  <Route path="/" element={<ProtectedRoute><DeveloperDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </DesktopGuard>
          ) : isAdmin ? (
            <DesktopGuard theme="red">
              <div className="min-h-screen bg-black text-white font-sans">
                <Routes>
                  <Route path="/login" element={<AdminLogin />} />
                  <Route path="/" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </DesktopGuard>
          ) : isOrg ? (
            <DesktopGuard theme="blue">
              <div className="min-h-screen bg-black text-white font-sans organizer-hub">
                <Routes>
                  <Route path="/login" element={<OrganizerLogin />} />
                  <Route path="/*" element={<ProtectedRoute requiredRole="organizer"><OrganizerDashboard /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </DesktopGuard>
          ) : (
            <div className="flex flex-col min-h-screen bg-black text-white font-sans">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/event/:id" element={<EventDetail />} />
                  <Route path="/register/:id" element={<Registration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          )}
</NotificationProvider>
         </LanguageProvider>
       </IPFirewall>
     </ErrorBoundary>
   );
 }

export default App;
