# Backend: Quiz question options must be populated

The frontend requests course data with quiz questions **and their answer options**. If `options` are not populated, the quiz UI shows the question text but **no answer choices**.

---

## 1. What the frontend sends

The course-by-ID request already includes:

```
GET /api/courses/:documentId?populate[quiz][populate][quiz_questions][populate][options]=true&...
```

So the frontend is asking for: **course → quiz → quiz_questions → options**.

---

## 2. What the backend must return

Each item in `data.quiz[].quiz_questions[]` should include an **`options`** array. Each option should have at least:

- **`option_key`** – e.g. `"A"`, `"B"`, `"C"`, `"D"` (used for correct answer and submission).
- **`option_label`** – the text shown to the user (e.g. `"Option A"`, `"To prevent accidents"`).

**Example shape:**

```json
{
  "data": {
    "quiz": [
      {
        "id": 348,
        "language": "English",
        "title": "IT Security Quiz",
        "quiz_questions": [
          {
            "id": 368,
            "order": 1,
            "question_id": "security-course3-q1",
            "question_text": "Security Question 1?",
            "question_type": "Multiple_choice",
            "point": 1,
            "correct_answer": "C",
            "options": [
              { "id": 1, "option_key": "A", "option_label": "Option A" },
              { "id": 2, "option_key": "B", "option_label": "Option B" },
              { "id": 3, "option_key": "C", "option_label": "Option C" },
              { "id": 4, "option_key": "D", "option_label": "Option D" }
            ]
          }
        ]
      }
    ]
  }
}
```

Strapi may return options as a relation, e.g.:

- `options: { data: [ { id, attributes: { option_key, option_label } }, ... ] }`  
  or  
- `options: [ { id, option_key, option_label }, ... ]`

The frontend normalizes both. The important part is that **each quiz_question has a non-empty `options` array (or equivalent)** after populate.

---

## 3. What to check on the backend (Strapi)

1. **Relation name**  
   On the **quiz_question** content-type (or component), the relation to the options must be **populated**.  
   - If the field is named `options`, then `populate[quiz][populate][quiz_questions][populate][options]=true` is correct.  
   - If the field is named e.g. `question_options`, the frontend would need to send that key; typically the backend exposes it as `options` in the response.

2. **Populate depth**  
   Ensure Strapi is actually populating that relation when the request includes  
   `populate[quiz][populate][quiz_questions][populate][options]=true`.  
   - Check the controller/service that builds the course response.  
   - For Strapi v4: ensure the query uses the same populate structure so that `quiz_questions.options` (or `quiz_questions.question_options`) is included.

3. **Permissions**  
   The content-type that holds the options (e.g. “quiz option” or “question option”) must be **find**able by the role used for the course request (e.g. Public or Authenticated), otherwise Strapi may omit the relation.

4. **Response**  
   After a fix, the course API response should show each `quiz_questions` entry with an `options` array (or `options.data`) containing objects that have `option_key` and `option_label`.

---

## 4. Summary for backend

- **Issue:** Course API returns `quiz_questions` **without** `options`, so the quiz has no answer choices in the UI.
- **Fix:** Populate the **options** relation on each quiz_question and return it in the course response (with `option_key` and `option_label` per option).
- **Request:** The frontend already sends  
  `populate[quiz][populate][quiz_questions][populate][options]=true`;  
  the backend must honor this and return the options in the response.
