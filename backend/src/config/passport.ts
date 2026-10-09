import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { db } from '../db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

// Default tenant for new OAuth users
const DEFAULT_TENANT_ID = 'TN-4092';
const DEFAULT_TENANT_NAME = 'Apollo Health Network';

export function configurePassport() {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          const googleId = profile.id;
          const profilePicture = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          // Check if user exists by Google ID
          let user = await db.getUserByGoogleId(googleId);

          if (!user) {
            // Check if user exists by email (linking existing local account)
            user = await db.getUserByEmail(email);

            if (user) {
              // Link Google account to existing user
              user = await db.linkGoogleAccount(user.id, {
                googleId,
                profilePicture,
                emailVerified: true,
              });
            } else {
              // Create new user with Google OAuth
              user = await db.createOAuthUser({
                email,
                name,
                googleId,
                profilePicture,
                provider: 'google',
                emailVerified: true,
                role: 'Clinical Pharmacist',
                title: 'Healthcare Practitioner',
                tenantId: DEFAULT_TENANT_ID,
                tenantName: DEFAULT_TENANT_NAME,
              });
            }
          } else {
            // Update last login and profile picture if changed
            user = await db.updateUserProfile(user.id, {
              profilePicture,
              lastLoginAt: new Date(),
            });
          }

          // Remove password hash from user object
          const { passwordHash: _p, ...safeUser } = user;
          return done(null, safeUser);
        } catch (error: any) {
          console.error('Google OAuth error:', error);
          return done(error, undefined);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.getUserById(id);
      if (user) {
        const { passwordHash: _p, ...safeUser } = user;
        done(null, safeUser);
      } else {
        done(new Error('User not found'), null);
      }
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
