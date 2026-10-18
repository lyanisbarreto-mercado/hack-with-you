// config/passport.js
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  state: true,   // CSRF protection on the OAuth flow
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      const verified = profile.emails?.[0]?.verified;
      // Link to an existing account only if Google has verified that email
      user = email && verified ? await User.findOne({ email }) : null;
      if (user) {
        user.googleId = profile.id;
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          email,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
          username: `user_${profile.id.slice(-8)}`,  // let them change it later
        });
      }
    }
    done(null, user);
  } catch (err) { done(err); }
}));