// import {useState} from 'react';
import './App.css';
import {Routes, Route, Navigate} from 'react-router-dom';
// import {Link} from 'react-router-dom';
import {LoginPage} from './pages/LoginPage';
import {Header} from './layouts/Header';
import {Footer} from './layouts/Footer';
import {AuthLoadingPage} from './pages/AuthLoadingPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {AuthProvider} from './contexts/AuthContext';
import {DashboardPage} from './pages/DashboardPage';
import SignUpPage from './pages/SignUpPage';
import Redirector from './pages/Redirector';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Header />
        <Routes>
          <Route element={<AuthLoadingPage />}>
            <Route path="/about" element={<AboutPage />} />
            <Route element={<Redirector onAuthenticated="/dashboard" />}>
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Route>
            <Route element={<Redirector onUnauthenticated="/login" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </div>
  );
}
