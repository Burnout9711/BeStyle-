import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CinematicHomepage from './pages/CinematicHomepage';
import QuizPage from './pages/QuizPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import LoaderTestPage from './pages/LoaderTestPage';
import EnhancedProfilePage from './pages/EnhancedProfilePage';
import OutfitSuggestionsPage from './pages/OutfitSuggestionsPage';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CinematicHomepage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<EnhancedResultsPage />} />
            <Route path="/loader-test" element={<LoaderTestPage />} />
            {/* /profile is PUBLIC - OAuth landing page but shows enhanced profile when authenticated */}
            <Route path="/profile" element={<EnhancedProfilePage />} />
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/outfits" element={<EnhancedProfilePage />} />
              <Route path="/outfit-suggestions" element={<OutfitSuggestionsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;