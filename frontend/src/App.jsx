import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import theme from './styles/theme';

// Page imports
import LandingPage from './pages/LandingPage';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import MyDocuments from './pages/MyDocuments';
import Token from './pages/Token';
import Login from './pages/Login';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/documents" element={<MyDocuments />} />
                      <Route path="/token" element={<Token />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;