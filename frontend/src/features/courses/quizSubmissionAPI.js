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

// Send re-attempt request when max attempts reached (custom endpoint - bypasses REST validation)
export const sendReattemptRequest = async (userId, courseId) => {
  return api.post('/quiz-reattempt-request/send', { userId: Number(userId), courseId: Number(courseId) });
};

// Check if user has a pending reattempt request (blocks assessment until admin approves)
export const checkPendingReattemptRequest = async (userId, courseId) => {
  const res = await api.get('/quiz-reattempt-request/pending', {
    params: { userId: Number(userId), courseId: Number(courseId) },
  });
  return res?.hasPending ?? false;
};
