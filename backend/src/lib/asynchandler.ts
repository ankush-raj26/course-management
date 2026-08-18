import  type { Request, Response, NextFunction } from "express";
import type { UserRequest } from "../types/express.js";

 export const asyncHandler = (
    fn: (req: UserRequest, res: Response, next?: NextFunction) => Promise<any>
) => {
    return (req: UserRequest, res: Response, next: NextFunction) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((err) => next(err));
    };
};



