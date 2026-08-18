import type { Request } from "express";

export interface UserRequest extends Request {
    user?: {
        id:number;
        email: string;
        role: "STUDENT" | "ADMIN"  | "INSTRUCTOR";
    };
}