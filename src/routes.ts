import { Router } from "express";
import { createCustomerController } from "./useCases/CreateCustomer";
import { createServiceController } from "./useCases/CreateService";
import { authenticateUserController } from "./useCases/AuthenticateUser";
import { createUserController } from "./useCases/CreateUser";

const router = Router();

router.post("/login", (request, response) => {
	authenticateUserController.handle(request, response);
});

router.post("/users", (request, response) => {
	createUserController.handle(request, response);
});

router.post("/customers", (request, response) => {
	createCustomerController.handle(request, response);
});

router.post("/services", (request, response) => {
	createServiceController.handle(request, response);
});

export { router };
