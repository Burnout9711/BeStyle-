import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import CinematicHomepage from './pages/CinematicHomepage';
import QuizPage from './pages/QuizPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CinematicHomepage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<EnhancedResultsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;