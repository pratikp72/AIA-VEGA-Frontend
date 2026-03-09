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
  const uid = Number(userId);
  const cid = Number(courseId);
  if (!Number.isFinite(uid) || !Number.isFinite(cid)) {
    throw new Error('Valid userId and courseId are required to send reattempt request.');
  }
  const payload = { userId: uid, courseId: cid };
  return api.post('/quiz-reattempt-request/send', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  });
};

// Check if user has pending or rejected reattempt request.
// Returns { hasPending, hasRejected, canRequestAgainAt }.
// hasRejected is true only when rejection was within last 24h; after 24h the assessment button is enabled again.
export const checkPendingReattemptRequest = async (userId, courseId) => {
  const res = await api.get('/quiz-reattempt-request/pending', {
    params: { userId: Number(userId), courseId: Number(courseId) },
  });
  return {
    hasPending: res?.hasPending ?? false,
    hasRejected: res?.hasRejected ?? false,
    canRequestAgainAt: res?.canRequestAgainAt ?? null,
  };
};
