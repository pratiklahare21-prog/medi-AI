import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { generateToken } from '../middleware/auth';

export const oauthRouter = Router();

// Google OAuth initiation
// GET /api/auth/google
oauthRouter.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// Google OAuth callback
// GET /api/auth/google/callback
oauthRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=oauth_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_user`);
      }

      // Generate JWT token
      const token = generateToken(user);

      // Redirect to frontend with token in URL (will be caught by frontend and stored)
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=callback_failed`);
    }
  }
);

// Google One-Tap Sign In (Token verification)
// POST /api/auth/google/verify
oauthRouter.post('/google/verify', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'No credential provided',
        error: 'No credential provided'
      });
      return;
    }

    // Verify Google token using Google's OAuth2 client
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      res.status(401).json({
        success: false,
        message: 'Invalid Google token',
        error: 'Invalid Google token'
      });
      return;
    }

    // Import db here to avoid circular dependency
    const { db } = await import('../db');

    const email = payload.email;
    const name = payload.name || 'User';
    const googleId = payload.sub;
    const profilePicture = payload.picture;
    const emailVerified = payload.email_verified || false;

    // Check if user exists
    let user = await db.getUserByGoogleId(googleId);

    if (!user) {
      // Check if user exists by email
      user = await db.getUserByEmail(email);

      if (user) {
        // Link Google account
        user = await db.linkGoogleAccount(user.id, {
          googleId,
          profilePicture,
          emailVerified,
        });
      } else {
        // Create new user
        const DEFAULT_TENANT_ID = 'TN-4092';
        const DEFAULT_TENANT_NAME = 'Apollo Health Network';

        const newUser = await db.createOAuthUser({
          email,
          name,
          googleId,
          profilePicture,
          provider: 'google',
          emailVerified,
          role: 'Clinical Pharmacist',
          title: 'Healthcare Practitioner',
          tenantId: DEFAULT_TENANT_ID,
          tenantName: DEFAULT_TENANT_NAME,
        });

        user = { ...newUser, passwordHash: '' } as any;
      }
    } else {
      // Update last login
      user = await db.updateUserProfile(user.id, {
        profilePicture,
        lastLoginAt: new Date(),
      });
    }

    const { passwordHash: _p, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Signed in successfully with Google',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Google One-Tap verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify Google credentials',
      error: error.message || 'Failed to verify Google credentials',
    });
  }
});

export default oauthRouter;
