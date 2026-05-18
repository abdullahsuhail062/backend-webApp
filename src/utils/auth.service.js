/**
 * Helper to set Authentication Cookies
 * @param {Object} res - Express response object
 * @param {Object} tokens - Object containing accessToken and refreshToken
 */
export const setAuthCookies = (res, tokens) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const accessTokenOptions = {
    httpOnly: true,
    secure: true, // 🔒 HTTPS in production, false for localhost
    sameSite: 'strict', // 🛑 'none' requires 'secure: true'
  };
   const refreshTokenOptions = {
    httpOnly: true,
    secure: true, // 🔒 HTTPS in production, false for localhost
    sameSite: 'strict', // 🛑 'none' requires 'secure: true'
    path: '/',
  };

  // Set Access Token (Short lived)
  res.cookie('accessToken', tokens.accessToken, {
    ...accessTokenOptions,
    maxAge: 15 * 60 * 1000, // 15 Minutes
  });

  // Set Refresh Token (Long lived)
  res.cookie('refreshToken', tokens.refreshToken, {
    ...refreshTokenOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
  });
};

export const clearAuthCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
};

export const setAuthCookiesForAccessToken = (res, tokens) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const accessTokenOptions = {
    httpOnly: true,
    secure: true, // 🔒 HTTPS in production, false for localhost
    sameSite: 'lax', // 🛑 'none' requires 'secure: true'
  };

   // Set Access Token (Short lived)
  res.cookie('accessToken', tokens.accessToken, {
    ...accessTokenOptions,
    maxAge: 15 * 60 * 1000, // 15 Minutes
  });

}

export const setAuthCookiesForRefreshToken = (res, tokens) => {

  const refreshTokenOptions = {
    httpOnly: true,
    secure: true, // 🔒 HTTPS in production, false for localhost
    sameSite: 'lax', // 🛑 'none' requires 'secure: true'
    path: '/',
  };

   // Set Access Token (Short lived)
  res.cookie('refreshToken', tokens.refreshToken, {
    ...refreshTokenOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
  });

}