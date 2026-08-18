import  * as z from "zod";
type status = "public" | "private"
export const courseType = z.object ({
    instructorId : z.coerce.number().int().positive()   ,
    categoryId : z.coerce.number().int().positive() ,
    title : z.string().min(3 , "too short title").max(100 , "max length exceed") , 
    description : z.string().min(3 , "too short description").max(100 , "max length exceed") , 
    status : z.enum(["PUBLIC" , "PRIVATE"]),

})