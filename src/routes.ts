import { Router } from "express";
import { createUserController } from "./useCases/CreateUser";

const router = Router();

router.post("/users", (request, response) => {
    createUserController.handle(request, response);
});

export { router };
