const { admin, db } = require('../config/firebase');

/**
 * Assign role to user (Admin only)
 */
exports.assignRole = async (req, res) => {
  try {
    const { targetEmail, role, metadata } = req.body;

    // Validate role
    const validRoles = ['admin', 'verified_rep', 'club_lead', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        valid_roles: validRoles
      });
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(targetEmail);
    const uid = userRecord.uid;

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { 
      role,
      batch: metadata?.batch || null
    });

    // Update Firestore
    await db.collection('users').doc(uid).set({
      uid,
      email: targetEmail,
      role,
      metadata: metadata || {},
      verified_at: admin.firestore.FieldValue.serverTimestamp(),
      verified_by: req.user.uid
    }, { merge: true });

    res.json({ 
      message: 'Role assigned successfully',
      user: targetEmail,
      role,
      note: 'User must sign out and sign back in for changes to take effect'
    });

  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Revoke role (demote to student)
 */
exports.revokeRole = async (req, res) => {
  try {
    const { targetEmail } = req.body;

    const userRecord = await admin.auth().getUserByEmail(targetEmail);
    const uid = userRecord.uid;

    // Reset to student
    await admin.auth().setCustomUserClaims(uid, { role: 'student' });

    await db.collection('users').doc(uid).update({
      role: 'student',
      metadata: {},
      revoked_at: admin.firestore.FieldValue.serverTimestamp(),
      revoked_by: req.user.uid
    });

    res.json({ message: 'Role revoked', user: targetEmail });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * List all users with roles
 */
exports.listUsers = async (req, res) => {
  try {
    // 1️⃣ Get users from Firebase Auth
    const authResult = await admin.auth().listUsers(1000);

    // 2️⃣ Fetch Firestore users
    const firestoreSnapshot = await db.collection('users').get();

    // 3️⃣ Create lookup map: uid -> firestore data
    const firestoreUsersMap = {};
    firestoreSnapshot.forEach(doc => {
      firestoreUsersMap[doc.id] = doc.data();
    });

    // 4️⃣ Merge Auth + Firestore
    const users = authResult.users.map(authUser => {
      const firestoreUser = firestoreUsersMap[authUser.uid];

      return {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || null,
        photoURL: authUser.photoURL || null,

        // 🔐 ROLE LOGIC
        role: firestoreUser?.role || 'student',
        batch: firestoreUser?.metadata?.batch || null,

        // 🧾 METADATA
        metadata: firestoreUser?.metadata || {},

        // ⏱ AUTH METADATA
        created_at: authUser.metadata.creationTime,
        last_login: authUser.metadata.lastSignInTime,

        // 🔖 FLAGS
        has_firestore_profile: !!firestoreUser,
        disabled: authUser.disabled || false
      };
    });

    res.json({
      count: users.length,
      users
    });

  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current user's role and permissions
 */
exports.getMyRole = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role,
      batch: req.user.batch,
      permissions: getRolePermissions(req.user.role),
      ...userDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper: Get permissions by role
 */
function getRolePermissions(role) {
  const permissions = {
    admin: [
      'upload_timetable',
      'assign_roles',
      'lock_rooms',
      'cancel_any_booking',
      'view_analytics'
    ],
    verified_rep: [
      'mark_room_free',
      'view_batch_schedule'
    ],
    club_lead: [
      'book_room',
      'cancel_own_booking',
      'view_availability'
    ],
    student: [
      'view_availability'
    ]
  };

  return permissions[role] || permissions.student;
}

module.exports = exports;