import Cookies from 'js-cookie';
import { io, type Socket } from 'socket.io-client';

export const getAccessToken = (): string | undefined => {
  let token = Cookies.get('accessToken');
  if (!token) {
    try {
      if (typeof window !== 'undefined') {
        token = window.localStorage.getItem('accessToken') || undefined;
      }
    } catch {
      // ignore
    }
  }
  return token;
};

export const getSupportChatServerUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  try {
    return new URL(apiUrl).origin;
  } catch {
    return 'http://localhost:3001';
  }
};

export const createSupportChatSocket = (): Socket => {
  const token = getAccessToken();
  const baseUrl = getSupportChatServerUrl();

  return io(`${baseUrl}/support-chat`, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });
};
