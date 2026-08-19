# Course Management API


Backend for a small Udemy type app. Students enroll in courses, watch lessons, give quizes and leave reviews. Instructors create the courses and quizes. Admin sits on top and can publish or block stuff.

Everything is REST, JSON in JSON out, auth is a JWT kept in a httpOnly cookie.

---

## What is inside

| Thing | Why it is here |
|---|---|
| **TypeScript** | `strict` is on, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Catches the dumb stuff at compile time. |
| **Zod** | Every request body is parsed before it touches the db. Types come out of the schema so there is one source of truth. |
| **Prisma** | ORM + migrations. Uses the `@prisma/adapter-pg` driver adapter (Prisma 7 way). |
| **Postgres** | Relational data, lots of joins, nothing else made sense here. |
| **Pagination** | List endpoints never return the whole table. `skip` / `take` with a stable `orderBy: { id: "asc" }`. |
| **Indexes** | On the columns we actually filter and join on. See below. |
| **asyncHandler** | One wrapper instead of a try/catch in all 20 controllers. |
| **Swagger** | Live docs at `/api-docs`. |
| **Logging** | Request logs + errors, so a 500 in prod is not a mystery. |
| **ESLint + Prettier** | Keeps the diff noise down. |
| **Tests** | Route tests + a seed script so the tests have something to run against. |
| **Docker** | `Dockerfile` for the api, compose brings up postgres with it. |

---

## Running it



```bash
docker compose up --build
```

The api container waits for postgres, runs the migrations, then starts. If you only want the image:

```bash
docker build -t course-api ./backend
docker run --env-file backend/.env -p 3000:3000 course-api
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | build + run |
| `npm run lint` | eslint over `src` |
| `npm run seed` | fills the db with sample users, courses, lessons, quizes |
| `npm  run test` | runs the route tests |

---

## Endpoints

Full request/response shapes are in Swagger, this is just the map.

### Auth (same shape for all three roles)

| Method | Path | Who |
|---|---|---|
| POST | `/user/signup` | public |
| POST | `/user/signin` | public |
| POST | `/instructor/signup` | public |
| POST | `/instructor/signin` | public |
| POST | `/admin/signup` | public |
| POST | `/admin/signin` | public |

Sign in sets `token` as a httpOnly + sameSite=strict cookie. Nothing to store on the client.

### Courses

| Method | Path | Who |
|---|---|---|
| GET | `/course` | public, paginated |
| POST | `/course/create` | instructor |
| PUT | `/course/publish` | instructor (own course only) or admin |

### Student

| Method | Path | Who |
|---|---|---|
| GET | `/user/:userId/courseprog` | student |
| GET | `/user/quizresults` | student, instructor |

### Instructor

| Method | Path | Who |
|---|---|---|
| GET | `/instructor/:userId/courseprogress` | instructor |
| GET | `/instructor/:quizId/quizResults` | instructor |

---

## A few decisions 

**Why the email is not unique by itself.** It is `@@unique([email, role])`. Same person can be an instructor and also enroll as a student with the same mail id. Happens all the time on these platforms.

**Pagination.** Offset based (`skip` / `take`, page size 10) with `orderBy: { id: "asc" }` so rows do not jump around between pages. Cursor pagination is better once the tables get big, that is a todo.

**Indexes.** Added where the query planner was doing a seq scan:

- `Course` -> `instructorId`, `categoryId`, `status`
- `Section` -> `courseId`, `parentId`
- `Lesson` -> `sectionId`
- `QuizAttempt` -> `studentId`, `quizId`
- unique on `Enrollment(studentId, courseId)` and `Progress(studentId, lessonId)` so a double click can not create a duplicate row

**No try/catch in controllers.** `asyncHandler` wraps the handler, catches the rejected promise and forwards it to `next()`. The error middleware at the end of each router logs it and sends the response. Controllers stay readable.

```ts
userRouter.post("/signup", asyncHandler(studentSignup));
```

**Validation.** Zod schemas live in `src/lib/typeValidator`. `safeParse` first, then the db call. The first issue message is what the client gets back, not the whole zod error dump.

**Logging.** Method, path, status and time on every request. Errors log the stack. Body is not logged becuase passwords would end up in the log file.

---

## Tests

Jest + supertest. The tests hit the real routes on the real database, there is no mocking of prisma.

What is covered:

- `GET /life` answers back so we know the server actually came up
- signing up a student with a good body creates the user and gives back 200
- a 3 character password is rejected and the message says the password is too short
- a mail that is not a mail gets rejected by zod, nothing reaches the db
- the same mail can sign up once as a student and once as an instructor, both work, this is the `@@unique([email, role])` thing

Run them:

```bash
npm test
```

### Seeding

`npm run seed` creates one category, one instructor, one student, 12 courses, a section with a lesson, a quiz with a question and one enrollment. 12 courses is enough to actually see the pagination doing something. The script wipes the tables first, so running it twice does not double the data.

---

## Folder layout

```
backend/
  src/
    auth/            jwt middleware + rbac
    controllers/     student / instructor / admin / course
    routes/          route definitions and swagger comments
    lib/
      typeValidator/ zod schemas
      asynchandler.ts
      errorHandler.ts
    db/prisma/       schema + migrations
    swagger/         openapi config
    types/           express request with user on it
```

---

## Todo

- refresh token + access token instead of one long lived token
- cursor pagination on the course list
- rate limit on the signin routes
- move the quiz scoring into a service, controller is getting fat
- learn about how  companies detect piration and how they work with the drm 
- how to create digital fingerprint of the video (if i get time 😁)