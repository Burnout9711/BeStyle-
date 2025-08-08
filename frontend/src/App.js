import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import CinematicHomepage from './pages/CinematicHomepage';
import QuizPage from './pages/QuizPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import LoaderTestPage from './pages/LoaderTestPage';
import ProfilePage from './pages/ProfilePage';

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
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;