import { Router } from "express";
import { createCustomerController } from "./useCases/CreateCustomer";
import { createUserController } from "./useCases/CreateUser";

const router = Router();

router.post("/users", (request, response) => {
	createUserController.handle(request, response);
});

router.post("/customers", (request, response) => {
	createCustomerController.handle(request, response);
});

export { router };
