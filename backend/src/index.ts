import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { swaggerSpec } from "./swagger/swagger.js";
import swaggerUi from "swagger-ui-express";
import { PrismaClient } from "./db/generated/prisma/client.js";
import { Roles } from "./db/generated/prisma/enums.js";
import { userRouter } from "./routes/studentRoutes.js";
import { instructorRouter } from "./routes/instructorRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { asyncHandler } from "./lib/asynchandler.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.get("/life" , (req , res)=>{
  res.json({message : "ping"});

})


app.use("/user" , userRouter);
app.use("/instructor" , instructorRouter);
app.use("/admin" , adminRouter);




const port = process.env.PORT || 3000;

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(asyncHandler);


app.listen(port, () => {
  console.log("Server is running on port " + port);
});