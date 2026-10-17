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
import { createAppointmentController } from "./useCases/CreateAppointment";
import { listAppointmentsController } from "./useCases/ListAppointments";
import { getAppointmentController } from "./useCases/GetAppointment";
import { updateAppointmentController } from "./useCases/UpdateAppointment";
import { listUsersController } from "./useCases/ListUsers";
import { listReferralsController } from "./useCases/ListReferrals";
import { createReferralController } from "./useCases/CreateReferral";
import { cancelReferralController } from "./useCases/CancelReferral";

const router = Router();

router.post("/login", (request, response) => {
	authenticateUserController.handle(request, response);
});

router.post("/users", (request, response) => {
	createUserController.handle(request, response);
});

router.get("/users", (request, response) => {
	listUsersController.handle(request, response);
});

router.get("/appointments", (request, response) => {
	listAppointmentsController.handle(request, response);
});

router.post("/appointments", (request, response) => {
	createAppointmentController.handle(request, response);
});

router.get("/appointments/:id", (request, response) => {
	getAppointmentController.handle(request, response);
});

router.patch("/appointments/:id", (request, response) => {
	updateAppointmentController.handle(request, response);
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

router.get("/referrals", (request, response) => {
	listReferralsController.handle(request, response);
});

router.post("/referrals", (request, response) => {
	createReferralController.handle(request, response);
});

router.patch("/referrals/:id/cancel", (request, response) => {
	cancelReferralController.handle(request, response);
});

export { router };
