const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('users');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch(() => {
      done(new Error('Failed to deserialize an user'));
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '752063159021-mu9ml6jgdp35vv1fsmjn3l62gc20115m.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value,
        }).populate('childFolders');
        if (user) {
          user.googleId = profile.id;
        } else {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            folders: [],
          });
        }
        user = await user.save();
        user = await User.populate(user, 'childFolders');
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: '699003638676633',
      clientSecret: '98547153bc7c3cbb85c96b58121033e0',
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value,
        }).populate('childFolders');
        if (user) {
          user.facebookId = profile.id;
        } else {
          user = new User({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            folders: [],
          });
        }
        user = await user.save();
        user = await User.populate(user, 'childFolders');
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);
