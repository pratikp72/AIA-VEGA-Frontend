# Feedback submission – store course name

## Problem
Feedback submission entries are created but the course name does not appear in the admin list (shows "–").

## Cause
The `feedback-submission` content-type schema has no attribute for the course **name**. The controller already sets `course_name: courseTitle` when creating the entry, but Strapi ignores it because the attribute does not exist.

## Backend change required

Add a **string** attribute to the feedback-submission schema:

- **Name:** `course_name`
- **Type:** string (Text, single line or Long text as needed)
- **Required:** false (optional so existing data is valid)

After adding `course_name` to the schema, the existing controller code that does:

```js
course_name: courseTitle,  // from course entity title
```

will persist and the admin list will show the course name instead of "–".

No frontend change is needed; the frontend already sends `course` (relation ID) and the backend derives the title and stores it in `course_name`.
