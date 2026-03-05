'use strict';

/**
 * BACKEND + FRONTEND SPEC: Login with Emp Code / Emp ID / Email
 *
 * Goal:
 * - Allow users to log in with:
 *   - AIA: emp_code
 *   - VEGA: emp_id
 *   - OR email (existing behaviour)
 *
 * Frontend keeps sending: { identifier, password }.
 * Backend decides how to find the user.
 */

/*
========================================
1. Backend: Custom /auth/login endpoint
========================================

Folder structure (Strapi v4):

  src/
    api/
      auth/
        controllers/
          login.js
        routes/
          login.js

1.1 Controller: src/api/auth/controllers/login.js

module.exports = {
  async login(ctx) {
    const { identifier, password } = ctx.request.body || {};

    if (!identifier || !password) {
      return ctx.badRequest('identifier and password are required');
    }

    // Match on email, username, emp_code (AIA), or emp_id (VEGA)
    const or = [
      { email: identifier.toLowerCase() },
      { username: identifier },
      { emp_code: identifier },
      { emp_id: identifier },
    ];

    // 1) Find user by any of the above
    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { $or: or } });

    if (!user) {
      return ctx.unauthorized('Invalid credentials');
    }

    // 2) Validate password
    const userService = strapi
      .plugin('users-permissions')
      .service('user');

    const valid = await userService.validatePassword(password, user.password);
    if (!valid) {
      return ctx.unauthorized('Invalid credentials');
    }

    // 3) Issue JWT
    const jwtService = strapi
      .plugin('users-permissions')
      .service('jwt');

    const token = jwtService.issue({ id: user.id });

    // 4) Sanitize user before returning
    const { sanitize } = require('@strapi/utils');
    const sanitizedUser = await sanitize.contentAPI.output(
      user,
      strapi.getModel('plugin::users-permissions.user')
    );

    return ctx.send({
      jwt: token,
      user: sanitizedUser,
    });
  },
};


1.2 Route: src/api/auth/routes/login.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'auth.login',
      config: {
        auth: false, // public login
      },
    },
  ],
};


Notes:
- This does NOT remove /auth/local; it simply adds /auth/login for your portal.
- Make sure your user model has fields: emp_code, emp_id (string).
- Restart Strapi after adding these files.


=============================
2. Frontend: LoginForm usage
=============================

The frontend already has API endpoint mapping:

  API_ENDPOINTS.AUTH.LOGIN = '/auth/login';

Update LoginForm so it uses that endpoint and reflects the new identifier meaning.

2.1 In frontend/src/components/login/LoginForm.jsx:

- Change LOGIN_API to use the central endpoint:

  import { apiService } from '../../services/api';
  import { API_ENDPOINTS } from '@/services/endpoints';

  const LOGIN_API = API_ENDPOINTS.AUTH.LOGIN;

- Change the identifier field label + input type:

  <label className=\"glass-label\">
    Employee ID or Email
  </label>
  <input
    type=\"text\"                        // not \"email\" so emp_code / emp_id works
    placeholder=\"Enter Emp Code / Emp ID / Email\"
    value={identifier}
    onChange={e => setIdentifier(e.target.value)}
    className=\"glass-input\"
    required
  />

The submit logic stays the same:

  const response = await apiService.post(LOGIN_API, { identifier, password });

- On success we still expect: { jwt, user } and store them in localStorage.


==================
3. Quick checklist
==================

Backend:
- [ ] user model has fields: emp_code (AIA), emp_id (VEGA)
-. [ ] create src/api/auth/controllers/login.js as above
- [ ] create src/api/auth/routes/login.js as above
- [ ] restart Strapi

Frontend:
- [ ] LoginForm uses API_ENDPOINTS.AUTH.LOGIN instead of '/auth/local'
- [ ] Identifier field label/placeholder updated, input type set to \"text\"

After this, users can login with:
- AIA: their emp_code
- VEGA: their emp_id
- Or email, all through the same login form.

