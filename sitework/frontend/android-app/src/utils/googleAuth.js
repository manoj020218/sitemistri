import { SocialLogin } from '@capgo/capacitor-social-login';

let initialized = false;

const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export async function initializeGoogleAuth() {
  if (initialized || !webClientId) return;

  await SocialLogin.initialize({
    google: {
      webClientId,
      mode: 'online',
    },
  });

  initialized = true;
}

export async function getGoogleAccessToken() {
  await initializeGoogleAuth();

  const response = await SocialLogin.login({
    provider: 'google',
    options: {
      scopes: ['email', 'profile'],
    },
  });

  const result = response?.result || response;
  const accessToken = result?.accessToken?.token || result?.idToken || '';

  if (!accessToken) {
    throw new Error('Google token missing from Android login response.');
  }

  return accessToken;
}

export async function signOutGoogleAuth() {
  if (!initialized) return;

  try {
    await SocialLogin.logout({ provider: 'google' });
  } catch {}
}
