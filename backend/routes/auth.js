import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import {
  signUpWithEmail,
  signInWithEmailOrUsername,
  signOutUser,
  isLoggedIn,
} from '../controllers/auth-controller.js';

const router = Router();

//REGULAR EMAIL PASSWORD STRATEGY
router.post('/email-password/signup', signUpWithEmail);
router.post('/email-password/signin', signInWithEmailOrUsername);

// Google-login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.redirect('http://localhost:5173/signup?google-callback=true');
  }
);

router.get('/check', authMiddleware, (req, res) => {
  const token = req.cookies.access_token;
  res.json({
    token,
    user: {
      _id: req.user._id,
      role: req.user.role,
    },
  });
});

//SIGN OUT
router.post('/signout', authMiddleware, signOutUser);

//CHECK USER STATUS
router.get('/check/:_id', authMiddleware, isLoggedIn);

export default router;
