const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  VERIFY_SECURITY: `${API_BASE_URL}/api/auth/verify-security`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Dictionary
  RANDOM_WORD: `${API_BASE_URL}/api/dictionary/random`,
  GET_WORD: (word: string) => `${API_BASE_URL}/api/dictionary/word/${word}`,
  
  // Vocab Lists
  GET_LISTS: (userId: string) => `${API_BASE_URL}/api/vocab/lists/${userId}`,
  GET_LISTS_NO_HISTORY: (userId: string) => `${API_BASE_URL}/api/vocab/lists/${userId}/exclude-history`,
  CREATE_LIST: `${API_BASE_URL}/api/vocab/lists`,
  GET_WORDS: (userId: string, listId: string) => `${API_BASE_URL}/api/vocab/words/${userId}/${listId}`,
  ADD_WORD: `${API_BASE_URL}/api/vocab/words`,
  UPDATE_WORD: (wordId: string) => `${API_BASE_URL}/api/vocab/words/${wordId}`,
  DELETE_WORD: (wordId: string) => `${API_BASE_URL}/api/vocab/words/${wordId}`,
  DELETE_LIST: (listId: string) => `${API_BASE_URL}/api/vocab/lists/${listId}`,
};

export default API_BASE_URL;