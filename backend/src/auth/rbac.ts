import type { NextFunction , Request , Response} from "express"
import type { UserRequest } from "../types/express.js"

type argu = "STUDENT" | "ADMIN" | "INSTRUCTOR"

export const rbac = function (...allowedRoles : argu[]){
    return (req  : UserRequest, res : Response , next : NextFunction)=>{
           if(!req.user){
                return res.status(401).json({message : "invalid request"});
           }

           if(!allowedRoles.includes(req.user.role) ){
             return res.status(403).json({message : "access denied"});
             
           }

           next();


    }
}