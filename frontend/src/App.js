import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import RestructuredLandingPage from './pages/RestructuredLandingPage';
import QuizPage from './pages/QuizPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RestructuredLandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<EnhancedResultsPage />} />
          <Route path="/login" element={<AuthPage />} />
          {/* <Route path="/login" element={<SignupPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;