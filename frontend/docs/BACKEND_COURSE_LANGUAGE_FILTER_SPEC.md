# Backend: Course language filtering (courses, modules, quiz, feedback)

Use this spec so the backend returns only the selected language for course, modules, quiz, and feedback. Filtering must be done on the backend, not the frontend.

---

## 1. API contract

### 1.1 Get single course by ID

- **Endpoint:** `GET /api/courses/:documentId` (or `:id`)
- **New query parameter:** `language` (optional but recommended)
  - Type: string
  - Examples: `"English"`, `"Hindi"`
  - Case-sensitive or case-insensitive as per your content (recommend case-insensitive match)

**Behavior:**

- If `language` is **not** sent: keep current behavior (return full course with all languages in `modules`, `quiz`, `feedback`, etc.).
- If `language` **is** sent: before returning the response, filter all nested collections so that only items whose `language` field equals the requested language are included. Return the same response shape as today, but with filtered arrays.

**Response shape (unchanged):**  
`{ data: { id, documentId, title, description, ..., course_language, modules, thumbnail, feedback, quiz, orientation_detail, ... }, meta }`

**Filtering rules when `language` is provided:**

1. **`modules`**  
   - Include only modules where `module.language === requestedLanguage` (or case-insensitive equivalent).
2. **`quiz`**  
   - Include only quiz entries where `quiz.language === requestedLanguage`.
3. **`feedback`**  
   - Include only feedback entries where `feedback.language === requestedLanguage`.
4. **`orientation_detail`**  
   - If it has a `language` field, return it only when `orientation_detail.language === requestedLanguage`; otherwise return `null` when filtering by language.

**Important:**  
- Still return **`course_language`** (array of available languages, e.g. `["English", "Hindi"]`) in the course payload so the frontend can build the language dropdown.
- Do **not** filter the course root fields (e.g. `title`, `description` at course level) by language unless your schema is multi-language at root; only filter the nested collections above.

---

## 2. List courses (optional)

- **Endpoint:** `GET /api/courses`
- **New query parameter:** `language` (optional)

**Behavior:**

- If `language` is sent: either  
  - return only courses that have at least one module/quiz/feedback in that language, or  
  - return all courses but with nested `modules` / `quiz` / `feedback` already filtered by `language` (same rules as single course).  
  Choose one strategy and document it.
- Response shape remains as today (list of courses).

---

## 3. Implementation notes (Strapi-style)

- **Single course:**  
  After loading the course (e.g. by `documentId`) with relations populated, in the controller (or a custom service):

  1. Read `ctx.query.language` (or equivalent).
  2. If present, filter:
     - `data.modules` → keep only items where `language` matches.
     - `data.quiz` → keep only items where `language` matches.
     - `data.feedback` → keep only items where `language` matches.
     - If `data.orientation_detail` has `language`, set to `null` when it doesn’t match.
  3. Return the same `{ data, meta }` structure.

- **List courses:**  
  If you support `language` on list, apply the same filtering to each course’s nested arrays before returning, or filter which courses are returned (see above).

- Prefer **one place** (e.g. a shared helper or middleware) that applies this filtering so both single-course and list endpoints stay consistent.

---

## 4. Example (single course with language)

**Request:**  
`GET /api/courses/dmywd6qrsgkglr1a8w88qyyx?language=English`

**Response:**  
Same structure as today, but:

- `data.modules` → only modules with `language: "English"`.
- `data.quiz` → only quiz(zes) with `language: "English"`.
- `data.feedback` → only feedback with `language: "English"`.
- `data.course_language` → still `["English", "Hindi"]` (or whatever the course has).
- `data.orientation_detail` → only included if its `language` is `"English"`, else `null`.

---

## 5. Summary for backend AI

- Add optional **`language`** query parameter to:
  - `GET /api/courses/:documentId` (required for your frontend).
  - Optionally `GET /api/courses`.
- When `language` is provided, filter **on the backend**:
  - `modules` by `module.language`
  - `quiz` by `quiz.language`
  - `feedback` by `feedback.language`
  - `orientation_detail` by its `language` (if applicable).
- Always return **`course_language`** in the course payload.
- Keep the same response shape; only the nested arrays (and optionally `orientation_detail`) are filtered by language.
