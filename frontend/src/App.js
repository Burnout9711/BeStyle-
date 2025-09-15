import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import RestructuredLandingPage from './pages/RestructuredLandingPage';
import QuizPage from './pages/QuizPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages//Dashboard';
import EnhancedProfilePage from './pages/EnhancedProfilePage';
import OutfitSuggestionsPage from './pages/OutfitSuggestionsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {

  const clientId = '965120397324-8bt3aev27e0njuuoeffcub79oqaorpig.apps.googleusercontent.com' ;

  return (
    <div className="App">
      <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RestructuredLandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/login" element={
            
            <AuthPage />
            }
            />
          
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
          <Route path="/results" element={
            <RequireAuth>
              <EnhancedResultsPage />
            </RequireAuth>
          } />
          {/* <Route path="/login" element={<SignupPage />} /> */}
          {/* /profile is PUBLIC - OAuth landing page but shows enhanced profile when authenticated */}
          <Route path="/profile" element={<EnhancedProfilePage />} />
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/outfits" element={<EnhancedProfilePage />} />
            <Route path="/outfit-suggestions" element={<OutfitSuggestionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
            </GoogleOAuthProvider>
    </div>
  );
}

export default App;