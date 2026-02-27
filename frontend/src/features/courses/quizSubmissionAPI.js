import api from '@/services/api';

export const submitQuiz = async (payload) => {
  return api.post('/quiz-submissions/submit', payload);
};

export const getLatestSubmission = async (userId, courseId) => {
  return api.get('/quiz-submissions/latest', { params: { userId, courseId } });
};

// Get a quiz submission by documentId
export const getQuizSubmission = async (documentId) => {
  return api.get(`/quiz-submissions/${documentId}`);
};
