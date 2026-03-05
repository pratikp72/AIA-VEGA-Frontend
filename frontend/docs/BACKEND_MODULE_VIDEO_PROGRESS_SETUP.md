# Backend: Module Video Progress (Mark as Read)

When a user clicks **"Mark as Read"** on a module, the frontend sends a request to create or update a row in the `module_video_progress` table. Below is what you need on the backend.

---

## 1. Register the custom route

Your controller has a custom action `markAsRead`, but Strapi does not expose it by default. You must add a **custom route** that calls this action.

**Where:** In your Strapi project, create or edit the routes file for the module-video-progress API.

**Path (Strapi v4):**  
`src/api/module-video-progress/routes/module-video-progress.js`  
(or `config/routes.js` if you define custom routes there)

**Add a route like this:**

```js
'use strict';

module.exports = {
  routes: [
    // Optional: keep default CRUD routes if you need them
    // ... existing routes ...
    {
      method: 'POST',
      path: '/module-video-progresses/mark-as-read',
      handler: 'module-video-progress.markAsRead',
    },
  ],
};
```

If the file already has a `routes` array, add only the new object to that array. This makes:

- **URL:** `POST /api/module-video-progresses/mark-as-read`
- **Handler:** `module-video-progress` controller’s `markAsRead` method

---

## 2. Request body the frontend sends

The frontend sends a **JSON body** like:

```json
{
  "userId": 3,
  "courseId": 292,
  "moduleIndex": 0,
  "moduleTitle": "module 1",
  "videoDurationMin": 20,
  "timeWatchedMin": 20
}
```

- `userId` – numeric ID of `plugin::users-permissions.user`
- `courseId` – numeric ID of `api::course.course`
- `moduleIndex` – 0-based index of the module in the current (language-filtered) list
- `moduleTitle` – title of the module (optional)
- `videoDurationMin` – module duration in minutes (optional)
- `timeWatchedMin` – minutes watched; for “mark as read” the frontend sends the full duration (optional)

Your controller already reads these from `ctx.request.body`, so no change is needed there if the body is parsed (default in Strapi).

---

## 3. Controller: relation IDs and draft/publish

Your controller uses `strapi.db.query` and expects `userId` and `courseId` as numbers. That matches what the frontend sends.

Two things to verify:

**a) Relation fields**  
You set `user: userId` and `course: courseId`. In Strapi, these must be the **database IDs** (primary key) of the user and course, not `documentId`. The frontend sends numeric `course.id` (and user id from auth), so this should be correct.

**b) Draft & Publish**  
Your schema has `"draftAndPublish": true`. If you create/update with `db.query` and do **not** set `publishedAt`, the record may stay in draft and not show in the admin. To have entries visible and “published” when the user marks as read, set `publishedAt` in the payload:

```js
const payload = {
  user: userId,
  course: courseId,
  module_index: moduleIndex,
  module_title: moduleTitle || null,
  video_completion_type: "full_watch",
  video_duration_min: videoDurationMin ?? 0,
  time_watched_min: timeWatchedMin ?? 0,
  last_updated: new Date(),
  publishedAt: new Date(),   // add this so the entry is published
};
```

Use the same `payload` for both `create` and `update`.

---

## 4. Checklist

| Step | Action |
|------|--------|
| 1 | Add route `POST /module-video-progresses/mark-as-read` → `module-video-progress.markAsRead` |
| 2 | Ensure request body is parsed (default in Strapi) so `ctx.request.body` has `userId`, `courseId`, `moduleIndex`, etc. |
| 3 | (Optional) Add `publishedAt: new Date()` to the create/update payload if you use draft & publish and want entries to show as published |
| 4 | Restart Strapi after changing routes |

---

## 5. How to test

1. Restart Strapi.
2. In the frontend, open a course and click **"Mark as Read"** on a module.
3. In Strapi Admin, open **Content Manager → Module Video Progress** and confirm a new row (or updated row) with the correct user, course, and `module_index`.

If you get 404, the route is not registered. If you get 400, check that `userId`, `courseId`, and `moduleIndex` are sent and that your controller validates them as in your existing code.

---

## 6. If entries still don’t appear: use entityService instead of db.query

With `db.query`, relation fields (`user`, `course`) may not map correctly to the DB in your Strapi version. Using **entityService** avoids that and sets relations and `publishedAt` correctly.

**Replace your controller** with this version:

```js
'use strict';

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::module-video-progress.module-video-progress",
  ({ strapi }) => ({
    async markAsRead(ctx) {
      const { userId, courseId, moduleIndex, moduleTitle, videoDurationMin, timeWatchedMin } = ctx.request.body || {};

      if (userId == null || courseId == null || moduleIndex === undefined) {
        return ctx.badRequest("Missing required fields: userId, courseId, moduleIndex");
      }

      const uid = "api::module-video-progress.module-video-progress";
      const filters = {
        user: { id: Number(userId) },
        course: { id: Number(courseId) },
        module_index: Number(moduleIndex),
      };

      const existing = await strapi.entityService.findMany(uid, {
        filters,
        limit: 1,
      }).then((list) => list[0] || null);

      const data = {
        user: Number(userId),
        course: Number(courseId),
        module_index: Number(moduleIndex),
        module_title: moduleTitle || null,
        video_completion_type: "full_watch",
        video_duration_min: Number(videoDurationMin) || 0,
        time_watched_min: Number(timeWatchedMin) || 0,
        last_updated: new Date(),
        publishedAt: new Date(),
      };

      let entry;
      if (existing) {
        entry = await strapi.entityService.update(uid, existing.id, { data });
      } else {
        entry = await strapi.entityService.create(uid, { data });
      }

      return ctx.send({
        message: "Module marked as completed",
        progress: entry,
      });
    },
  })
);
```

- Uses **entityService** so `user` and `course` relations are set by ID correctly.
- Sets **publishedAt** so entries show in the Admin when using Draft & Publish.
- Coerces **userId**, **courseId**, **moduleIndex**, and numeric fields so the request body is safe.
