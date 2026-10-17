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
import { listLoyaltyRulesController } from "./useCases/ListLoyaltyRules";
import { getLoyaltyRuleController } from "./useCases/GetLoyaltyRule";
import { createLoyaltyRuleController } from "./useCases/CreateLoyaltyRule";
import { updateLoyaltyRuleController } from "./useCases/UpdateLoyaltyRule";
import { setLoyaltyRuleActiveController } from "./useCases/SetLoyaltyRuleActive";
import { listCustomerRewardsController } from "./useCases/ListCustomerRewards";
import { cancelCustomerRewardController } from "./useCases/CancelCustomerReward";
import { grantManualCustomerRewardController } from "./useCases/GrantManualCustomerReward";
import { listMessageTemplatesController } from "./useCases/ListMessageTemplates";
import { getMessageTemplateController } from "./useCases/GetMessageTemplate";
import { createMessageTemplateController } from "./useCases/CreateMessageTemplate";
import { updateMessageTemplateController } from "./useCases/UpdateMessageTemplate";
import { setMessageTemplateActiveController } from "./useCases/SetMessageTemplateActive";
import { previewMessageTemplateController } from "./useCases/PreviewMessageTemplate";

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

router.get("/customers/:customerId/rewards", (request, response) => {
	listCustomerRewardsController.handle(request, response);
});

router.post("/customers/:customerId/rewards", (request, response) => {
	grantManualCustomerRewardController.handle(request, response);
});

router.patch(
	"/customers/:customerId/rewards/:rewardId/cancel",
	(request, response) => {
		cancelCustomerRewardController.handle(request, response);
	},
);

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

router.get("/loyalty-rules", (request, response) => {
	listLoyaltyRulesController.handle(request, response);
});

router.get("/loyalty-rules/:id", (request, response) => {
	getLoyaltyRuleController.handle(request, response);
});

router.post("/loyalty-rules", (request, response) => {
	createLoyaltyRuleController.handle(request, response);
});

router.patch("/loyalty-rules/:id", (request, response) => {
	updateLoyaltyRuleController.handle(request, response);
});

router.patch("/loyalty-rules/:id/active", (request, response) => {
	setLoyaltyRuleActiveController.handle(request, response);
});

router.get("/message-templates", (request, response) => {
	listMessageTemplatesController.handle(request, response);
});

router.get("/message-templates/:id", (request, response) => {
	getMessageTemplateController.handle(request, response);
});

router.post("/message-templates", (request, response) => {
	createMessageTemplateController.handle(request, response);
});

router.patch("/message-templates/:id", (request, response) => {
	updateMessageTemplateController.handle(request, response);
});

router.patch("/message-templates/:id/active", (request, response) => {
	setMessageTemplateActiveController.handle(request, response);
});

router.post("/message-templates/preview", (request, response) => {
	previewMessageTemplateController.handle(request, response);
});

export { router };
