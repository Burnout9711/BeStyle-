import { useState, useEffect, useCallback } from 'react';

export const useAdvancedQuiz = (quizData) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [validationErrors, setValidationErrors] = useState({});

  // Advanced branching logic
  const getNextStep = useCallback((currentStep, answers) => {
    // Example branching: Skip certain steps based on answers
    if (currentStep === 1 && answers.gender_identity === 'Prefer not to say') {
      // Skip body type questions for privacy
      return 3;
    }
    
    if (currentStep === 2 && answers.current_style?.includes("Don't know yet")) {
      // Skip style preferences if they don't know their style
      return 4;
    }
    
    return currentStep + 1;
  }, []);

  const getPreviousStep = useCallback((currentStep, answers) => {
    // Reverse branching logic
    if (currentStep === 3 && answers.gender_identity === 'Prefer not to say') {
      return 1;
    }
    
    if (currentStep === 4 && answers.current_style?.includes("Don't know yet")) {
      return 2;
    }
    
    return currentStep - 1;
  }, []);

  // Validation rules
  const validateStep = useCallback((stepData, stepAnswers) => {
    const errors = {};
    
    stepData.questions.forEach(question => {
      const answer = stepAnswers[question.id];
      
      if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
        errors[question.id] = 'This field is required';
      }
      
      if (question.type === 'multiple-choice' && question.maxSelections) {
        if (Array.isArray(answer) && answer.length > question.maxSelections) {
          errors[question.id] = `Please select at most ${question.maxSelections} options`;
        }
      }
      
      if (question.type === 'text' && question.minLength) {
        if (answer && answer.length < question.minLength) {
          errors[question.id] = `Please enter at least ${question.minLength} characters`;
        }
      }
    });
    
    return errors;
  }, []);

  // Handle answer changes
  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Clear validation error for this field
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Navigate to next step
  const handleNext = useCallback((stepData) => {
    const currentStepAnswers = {};
    stepData.questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        currentStepAnswers[q.id] = answers[q.id];
      }
    });
    
    const errors = validateStep(stepData, currentStepAnswers);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    const nextStep = getNextStep(currentStep, answers);
    if (nextStep < quizData.length) {
      setCurrentStep(nextStep);
      return true;
    }
    
    return 'complete';
  }, [currentStep, answers, quizData.length, validateStep, getNextStep]);

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    const prevStep = getPreviousStep(currentStep, answers);
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  }, [currentStep, answers, getPreviousStep]);

  // Calculate progress
  useEffect(() => {
    const totalQuestions = quizData.reduce((total, step) => total + step.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    setProgress(Math.round((answeredQuestions / totalQuestions) * 100));
  }, [answers, quizData]);

  // Update completion time
  useEffect(() => {
    const updateTime = () => {
      setCompletionTime(Math.round((Date.now() - startTime) / 1000));
    };
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Get personalized recommendations based on answers
  const getPersonalizedRecommendations = useCallback(() => {
    const recommendations = {
      confidence: 85,
      stylePersonality: 'Modern Minimalist',
      colorPalette: ['Black', 'White', 'Navy', 'Beige'],
      bodyTypeAdvice: 'Focus on structured pieces that enhance your natural silhouette',
      occasionPriority: ['Work', 'Casual', 'Social Events']
    };

    // Analyze answers for personalized insights
    if (answers.current_style?.includes('Minimalist')) {
      recommendations.confidence += 5;
      recommendations.stylePersonality = 'Sophisticated Minimalist';
    }

    if (answers.goals?.includes('Look more confident')) {
      recommendations.occasionPriority.unshift('Work');
    }

    if (answers.body_type === 'Athletic') {
      recommendations.bodyTypeAdvice = 'Fitted cuts and structured pieces will complement your athletic build perfectly';
    }

    return recommendations;
  }, [answers]);

  return {
    currentStep,
    answers,
    progress,
    completionTime,
    validationErrors,
    handleAnswer,
    handleNext,
    handlePrevious,
    canGoNext: currentStep < quizData.length - 1,
    canGoPrevious: currentStep > 0,
    isComplete: currentStep >= quizData.length,
    getPersonalizedRecommendations
  };
};