const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (credential) => {
  // Access token (from useGoogleLogin custom button) — does NOT start with 'eyJ'
  if (!credential.startsWith('eyJ')) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!res.ok) throw new Error('Invalid Google access token');
    const data = await res.json();
    if (!data.sub) throw new Error('Google userinfo failed');
    return {
      sub: data.sub, email: data.email, name: data.name,
      picture: data.picture, email_verified: data.email_verified,
    };
  }
  // ID token (from GoogleLogin component) — JWT starting with 'eyJ'
  const ticket = await client.verifyIdToken({
    idToken:  credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};

module.exports = { verifyGoogleToken };
