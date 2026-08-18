import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Course App API",
      version: "1.0.0",
      description: "Auth is a jwt kept in a httpOnly cookie called token.",
    },

    servers: [{ url: "http://localhost:3000" }],

    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
      },
    },
  },

  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
