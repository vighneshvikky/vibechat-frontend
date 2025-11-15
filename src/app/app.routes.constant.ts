export const API_ROUTES = {
    AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
    REFRESH: '/refresh'
  },
  USER: {
    BASE: '/users',
    ALL: '/all',
    CURRENT: '/userDetails'
  },

  CHAT: {
    BASE: '/chats',
    PRIVATE: '/private',
    GROUP: '/group',
    GET_MESSAGES: (chatId: string) => `/getChatMessages/${chatId}`,
    GET_CHAT: (chatId: string) => `/${chatId}`,
    JOIN: (chatId: string) => `/${chatId}/join`,
    LEAVE: (chatId: string) => `/${chatId}/leave`,
    UPLOAD: '/upload',
  },
};
