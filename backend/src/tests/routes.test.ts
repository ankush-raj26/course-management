import request from "supertest";
import { app } from "../index.js";

// small random mail so that the signup does not fail on the unique key
// when i run the tests again and again
const mail = "test" + Date.now() + "@mail.com";

describe("course app routes", () => {

  it("server is alive", async () => {
    const res = await request(app).get("/life");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("ping");
  });

  it("student can signup", async () => {
    const res = await request(app).post("/user/signup").send({
      name: "Ankush",
      email: mail,
      password: "password123",
      role: "STUDENT",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(mail);
  });

  it("signup fails when the password is too small", async () => {
    const res = await request(app).post("/user/signup").send({
      name: "Ankush",
      email: "small" + Date.now() + "@mail.com",
      password: "abc",
      role: "STUDENT",
    });

    // zod throws and the error handler catches it
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("too short password");
  });

  it("signup fails when the mail is not a proper mail", async () => {
    const res = await request(app).post("/user/signup").send({
      name: "Ankush",
      email: "notamail",
      password: "password123",
      role: "STUDENT",
    });

    expect(res.status).toBe(500);
  });

  it("same mail can be used for student and instructor both", async () => {
    // this is the whole point of @@unique([email, role])
    const res = await request(app).post("/instructor/signup").send({
      name: "Ankush",
      email: mail,
      password: "password123",
      role: "INSTRUCTOR",
    });

    expect(res.status).toBe(200);
  });

});
