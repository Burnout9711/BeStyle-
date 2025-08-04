import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Ruler, Palette, Briefcase, Heart, Camera } from 'lucide-react';
import { quizAPI } from '../services/api';
import AnimatedSection from '../components/AnimatedSection';
import Enhanced3DCard from '../components/Enhanced3DCard';

const QuizPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [quizSteps, setQuizSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize quiz session and load questions
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        
        // Start a new quiz session
        const sessionResponse = await quizAPI.startSession();
        setSessionId(sessionResponse.session_id);
        
        // Get quiz questions
        const questionsResponse = await quizAPI.getQuestions();
        
        // Map API questions to our quiz steps format
        const mappedSteps = [
          {
            id: 'basic_info',
            title: 'Basic Info',
            icon: User,
            description: 'These help build a user identity.',
            questions: questionsResponse.basic_info || []
          },
          {
            id: 'body_type',
            title: 'Body Type & Size',
            icon: Ruler,
            description: 'Helps in sizing and fit-based recommendations.',
            questions: questionsResponse.body_type || []
          },
          {
            id: 'style_preferences',
            title: 'Style Preferences',
            icon: Palette,
            description: 'These shape their personal style profile.',
            questions: questionsResponse.style_preferences || []
          },
          {
            id: 'lifestyle',
            title: 'Lifestyle & Occasions',
            icon: Briefcase,
            description: 'To tailor outfits based on daily needs.',
            questions: questionsResponse.lifestyle || []
          },
          {
            id: 'personality',
            title: 'Personality & Goals',
            icon: Heart,
            description: 'To connect with their deeper identity.',
            questions: questionsResponse.personality || []
          },
          {
            id: 'visual_aid',
            title: 'Visual Aid (Optional)',
            icon: Camera,
            description: 'To train the AI visually.',
            questions: questionsResponse.visual_aid || []
          }
        ];
        
        setQuizSteps(mappedSteps);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, []);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = async () => {
    try {
      if (currentStep < quizSteps.length - 1) {
        // Submit current step data to backend
        const currentStepData = quizSteps[currentStep];
        const stepAnswers = {};
        
        // Collect answers for current step
        currentStepData.questions.forEach(q => {
          if (answers[q.id] !== undefined) {
            stepAnswers[q.id] = answers[q.id];
          }
        });

        if (Object.keys(stepAnswers).length > 0) {
          await quizAPI.submitStep(sessionId, currentStep, stepAnswers);
        }
        
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - complete quiz and navigate to results
        
        // Submit final step data
        const currentStepData = quizSteps[currentStep];
        const stepAnswers = {};
        
        currentStepData.questions.forEach(q => {
          if (answers[q.id] !== undefined) {
            stepAnswers[q.id] = answers[q.id];
          }
        });

        if (Object.keys(stepAnswers).length > 0) {
          await quizAPI.submitStep(sessionId, currentStep, stepAnswers);
        }
        
        // Complete the quiz
        await quizAPI.completeQuiz(sessionId);
        
        // Navigate to results with session ID
        navigate(`/results?session=${sessionId}`);
      }
    } catch (err) {
      console.error('Error submitting quiz step:', err);
      // Don't block navigation on submission errors for now
      if (currentStep < quizSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        navigate(`/results?session=${sessionId}`);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="quiz-page" style={{ 
        background: 'var(--bg-page)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid var(--border-light)',
            borderTop: '3px solid var(--accent-purple-400)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h2>Loading Quiz...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-page" style={{ 
        background: 'var(--bg-page)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <h2>Oops! Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (quizSteps.length === 0) {
    return (
      <div className="quiz-page" style={{ 
        background: 'var(--bg-page)', 
        minHeight: '100vh'
      }}>
        <p>No quiz questions available.</p>
      </div>
    );
  }

  const currentStepData = quizSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="quiz-page" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Header */}
      <header className="header-nav">
        <div className="logo">BeStyle.AI</div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Back to Home
          </button>
        </div>
      </header>

      <div style={{ paddingTop: '100px', paddingBottom: '2rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              background: 'var(--border-light)', 
              height: '4px', 
              borderRadius: '2px',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'var(--accent-purple-400)',
                height: '100%',
                borderRadius: '2px',
                width: `${((currentStep + 1) / quizSteps.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p className="caption" style={{ textAlign: 'center' }}>
              Step {currentStep + 1} of {quizSteps.length}
            </p>
          </div>

          {/* Current Step */}
          <AnimatedSection animationType="slideInUp">
            <Enhanced3DCard intensity={0.8} style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div 
                  className="step-circle pulse-element"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent-purple-400) 0%, #b08fb5 100%)'
                  }}
                >
                  <IconComponent size={24} style={{ color: 'white' }} />
                </div>
                <h2 className="heading-1" style={{ marginBottom: '0.5rem' }}>
                  {currentStepData.title}
                </h2>
                <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                  {currentStepData.description}
                </p>
              </div>

            {/* Questions */}
            <div style={{ space: '2rem' }}>
              {currentStepData.questions.map((question, qIndex) => (
                <div key={qIndex} style={{ marginBottom: '2rem' }}>
                  <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
                    {question.question}
                  </h3>
                  
                  {question.type === 'multiple-choice' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {question.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          className={`btn-secondary ${answers[question.id] === option ? 'active' : ''}`}
                          onClick={() => handleAnswer(question.id, option)}
                          style={{
                            ...(answers[question.id] === option && {
                              background: 'var(--accent-purple-400)',
                              color: 'white',
                              borderColor: 'var(--accent-purple-400)'
                            })
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'multi-select' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {question.options.map((option, oIndex) => {
                        const isSelected = answers[question.id]?.includes(option);
                        return (
                          <button
                            key={oIndex}
                            className="btn-secondary"
                            onClick={() => {
                              const current = answers[question.id] || [];
                              const updated = isSelected 
                                ? current.filter(item => item !== option)
                                : [...current, option];
                              handleAnswer(question.id, updated);
                            }}
                            style={{
                              ...(isSelected && {
                                background: 'var(--accent-blue-400)',
                                color: 'white',
                                borderColor: 'var(--accent-blue-400)'
                              })
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'text' && (
                    <input
                      type="text"
                      placeholder={question.placeholder || 'Type your answer...'}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border-input)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'var(--bg-card)'
                      }}
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea
                      placeholder={question.placeholder || 'Share your thoughts...'}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border-input)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'var(--bg-card)',
                        resize: 'vertical'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          </AnimatedSection>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '2rem' 
          }}>
            <button 
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              style={{ 
                opacity: currentStep === 0 ? 0.5 : 1,
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Previous
            </button>

            <button 
              className="btn-primary"
              onClick={handleNext}
            >
              {currentStep === quizSteps.length - 1 ? 'Get My Results' : 'Next'}
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;