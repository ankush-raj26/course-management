import request from 'supertest';
import { app } from '../index.js';

// small random mail so that the signup does not fail on the unique key
// when i run the tests again and again
const mail = 'test' + Date.now() + '@mail.com';

describe('course app routes', () => {
  it('server is alive', async () => {
    const res = await request(app).get('/life');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('ping');
  });

  it('student can signup', async () => {
    const res = await request(app).post('/user/signup').send({
      name: 'Ankush',
      email: mail,
      password: 'password123'
     
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(mail);
  });

  it('signup fails when the password is too small', async () => {
    const res = await request(app)
      .post('/user/signup')
      .send({
        name: 'Ankush',
        email: 'small' + Date.now() + '@mail.com',
        password: 'abc'
      });

    // zod throws and the error handler catches it
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('too short password');
  });

  it('signup fails when the mail is not a proper mail', async () => {
    const res = await request(app).post('/user/signup').send({
      name: 'Ankush',
      email: 'notamail',
      password: 'password123',
    
    });

    expect(res.status).toBe(500);
  });

  it('same mail can be used for student and instructor both', async () => {
    // this is the whole point of @@unique([email, role])
    const res = await request(app).post('/instructor/signup').send({
      name: 'Ankush',
      email: mail,
      password: 'password123'
    });

    expect(res.status).toBe(200);
  });
});

// the tests above each check one route in isolation. this one instead plays through the whole
// app the way a real user would: admin makes a category, instructor makes a course and a quiz,
// student enrolls and takes it, admin blocks/unblocks/deletes. one test, everything wired together.
describe('full app flow', () => {
  it('goes from signup to admin actions across all three roles', async () => {
    const stamp = Date.now();
    const password = 'password123';

    // one agent per role so each one keeps its own login cookie, they cant mix up
    const adminAgent = request.agent(app);
    const instructorAgent = request.agent(app);
    const studentAgent = request.agent(app);

    const adminEmail = `flow-admin-${stamp}@mail.com`;
    const instructorEmail = `flow-inst-${stamp}@mail.com`;
    const studentEmail = `flow-stu-${stamp}@mail.com`;

    // --- admin signs up, signs in, makes a category ---
    let res = await adminAgent
      .post('/admin/signup')
      .send({ name: 'Flow Admin', email: adminEmail, password });
    expect(res.status).toBe(200);

    res = await adminAgent.post('/admin/signin').send({ email: adminEmail, password });
    expect(res.status).toBe(200);

    res = await adminAgent.get('/me');
    expect(res.body.user.role).toBe('ADMIN');

    res = await adminAgent.post('/admin/category').send({ title: 'Flow Category' });
    expect(res.status).toBe(200);
    const categoryId = res.body.category.id;

    // --- instructor signs up, signs in, creates a course, publishes it, adds a quiz ---
    res = await instructorAgent
      .post('/instructor/signup')
      .send({ name: 'Flow Inst', email: instructorEmail, password });
    expect(res.status).toBe(200);
    const instructorId = res.body.user.id;

    res = await instructorAgent
      .post('/instructor/signin')
      .send({ email: instructorEmail, password });
    expect(res.status).toBe(200);

    res = await instructorAgent.post('/course/create').send({
      instructorId,
      categoryId,
      title: 'Flow Course',
      description: 'a course made by the flow test',
      status: 'PRIVATE',
    });
    expect(res.status).toBe(200);
    const courseId = res.body.createdCourse.id;
    expect(res.body.createdCourse.status).toBe('PRIVATE');

    // shows up under "my courses" for the instructor who made it
    res = await instructorAgent.get('/course/mine');
    expect(res.body.courses.some((c: any) => c.id === courseId)).toBe(true);

    res = await instructorAgent.put('/course/publish').send({ courseId });
    expect(res.status).toBe(200);

    res = await request(app).get(`/course/${courseId}`);
    expect(res.body.course.status).toBe('PUBLIC');

    res = await instructorAgent.post('/instructor/quiz').send({
      courseId,
      title: 'Flow Quiz',
      passPercentage: 50,
      attemptLimit: 3,
      questions: [{ question: '2 + 2 = ?', options: ['3', '4', '5', '6'], correctAnswer: 1 }],
    });
    expect(res.status).toBe(200);

    // --- student signs up, signs in, enrolls, takes the quiz, leaves a review ---
    res = await studentAgent
      .post('/user/signup')
      .send({ name: 'Flow Stu', email: studentEmail, password });
    expect(res.status).toBe(200);
    const studentId = res.body.user.id;

    res = await studentAgent.post('/user/signin').send({ email: studentEmail, password });
    expect(res.status).toBe(200);

    res = await studentAgent.post(`/user/courses/${courseId}/enroll`);
    expect(res.status).toBe(200);

    res = await studentAgent.get('/user/courses');
    expect(res.body.courses.some((e: any) => e.courseId === courseId)).toBe(true);

    res = await studentAgent.get(`/course/${courseId}/quiz`);
    expect(res.status).toBe(200);
    const question = res.body.quiz.questions[0];
    // the correct answer should never be sent down to the student
    expect(question.correctAnswer).toBeUndefined();

    res = await studentAgent.post('/user/quiz/submit').send({
      courseId,
      answers: [{ questionId: question.id, answer: 1 }],
    });
    expect(res.status).toBe(200);
    expect(res.body.submitted.passed).toBe(true);

    res = await studentAgent.get('/user/quizresults');
    expect(res.body.results.length).toBeGreaterThan(0);

    res = await studentAgent
      .post(`/user/courses/${courseId}/review`)
      .send({ rating: 5, comments: 'flow test review' });
    expect(res.status).toBe(200);

    res = await request(app).get(`/course/${courseId}/reviews`);
    expect(res.body.reviews.some((r: any) => r.comment === 'flow test review')).toBe(true);

    // --- admin blocks the student, a blocked account gets 403, unblock brings it back ---
    res = await adminAgent.put(`/admin/users/${studentId}/block`);
    expect(res.status).toBe(200);

    res = await studentAgent.get('/user/courses');
    expect(res.status).toBe(403);

    res = await adminAgent.put(`/admin/users/${studentId}/unblock`);
    expect(res.status).toBe(200);

    res = await studentAgent.get('/user/courses');
    expect(res.status).toBe(200);

    // --- logout actually clears the cookie, instructor gets locked out of their own routes ---
    res = await instructorAgent.post('/logout');
    expect(res.status).toBe(200);

    res = await instructorAgent.get('/course/mine');
    expect(res.status).toBe(401);

    // --- admin deletes the student, soft delete should lock them out too ---
    res = await adminAgent.delete(`/admin/users/${studentId}`);
    expect(res.status).toBe(200);

    res = await studentAgent.get('/user/courses');
    expect(res.status).toBe(401);

    // sanity check on the two admin listing routes, not asserting membership here since the
    // dev database keeps data from earlier runs and these routes are paginated
    res = await adminAgent.get('/admin/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);

    res = await adminAgent.get('/admin/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.courses)).toBe(true);
  }, 20000);
});
