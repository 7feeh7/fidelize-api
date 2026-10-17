import { Router } from "express";
import { createCustomerController } from "./useCases/CreateCustomer";
import { deactivateCustomerController } from "./useCases/DeactivateCustomer";
import { listCustomersController } from "./useCases/ListCustomers";
import { updateCustomerController } from "./useCases/UpdateCustomer";
import { createServiceController } from "./useCases/CreateService";
import { deactivateServiceController } from "./useCases/DeactivateService";
import { listServicesController } from "./useCases/ListServices";
import { authenticateUserController } from "./useCases/AuthenticateUser";
import { createUserController } from "./useCases/CreateUser";

const router = Router();

router.post("/login", (request, response) => {
	authenticateUserController.handle(request, response);
});

router.post("/users", (request, response) => {
	createUserController.handle(request, response);
});

router.get("/customers", (request, response) => {
	listCustomersController.handle(request, response);
});

router.post("/customers", (request, response) => {
	createCustomerController.handle(request, response);
});

router.patch("/customers/:id", (request, response) => {
	updateCustomerController.handle(request, response);
});

router.delete("/customers/:id", (request, response) => {
	deactivateCustomerController.handle(request, response);
});

router.get("/services", (request, response) => {
	listServicesController.handle(request, response);
});

router.post("/services", (request, response) => {
	createServiceController.handle(request, response);
});

router.delete("/services/:id", (request, response) => {
	deactivateServiceController.handle(request, response);
});

export { router };
