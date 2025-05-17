// Social login service
const axios = require('axios');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Verify Google OAuth token and get user info
 * @param {string} token - Google OAuth token
 */
const verifyGoogleToken = async (token) => {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const { sub, email, name, picture } = response.data;
    
    return {
      providerId: sub,
      email,
      name,
      profileImage: picture
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new ApiError(401, 'Invalid Google token');
  }
};

/**
 * Verify Facebook OAuth token and get user info
 * @param {string} token - Facebook OAuth token
 */
const verifyFacebookToken = async (token) => {
  try {
    // First, verify the token with Facebook
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    const appAccessTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    );
    
    const appAccessToken = appAccessTokenResponse.data.access_token;
    
    const debugTokenResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appAccessToken}`
    );
    
    if (!debugTokenResponse.data.data.is_valid) {
      throw new Error('Invalid Facebook token');
    }
    
    // Get user info with the token
    const userInfoResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
    );
    
    const { id, name, email, picture } = userInfoResponse.data;
    
    return {
      providerId: id,
      email,
      name,
      profileImage: picture?.data?.url
    };
  } catch (error) {
    console.error('Error verifying Facebook token:', error);
    throw new ApiError(401, 'Invalid Facebook token');
  }
};

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken
};
