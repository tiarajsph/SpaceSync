const { admin, db } = require('../config/firebase');

/**
 * Verify Firebase ID token and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach user data to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'student', // From custom claims
      batch: decodedToken.batch || null
    };

    // Sync user document (create if doesn't exist)
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        uid: req.user.uid,
        email: req.user.email,
        role: 'student',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        last_login: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await userRef.update({
        last_login: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - ['admin', 'club_lead', etc.]
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Batch ownership check (for class reps)
 */
async function checkBatchOwnership(req, res, next) {
  if (req.user.role === 'admin') {
    return next(); // Admins bypass batch checks
  }

  const { batch } = req.body;
  
  if (req.user.role === 'verified_rep' && req.user.batch !== batch) {
    return res.status(403).json({ 
      error: 'Can only manage your own batch',
      your_batch: req.user.batch
    });
  }

  next();
}

module.exports = { authenticate, authorize, checkBatchOwnership };