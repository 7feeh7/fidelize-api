import { Router } from "express";
import { ensureAuthenticated } from "./middlewares";
import { authenticateUserController } from "./useCases/AuthenticateUser";
import { cancelCustomerRewardController } from "./useCases/CancelCustomerReward";
import { cancelMessageController } from "./useCases/CancelMessage";
import { cancelReferralController } from "./useCases/CancelReferral";
import { createAppointmentController } from "./useCases/CreateAppointment";
import { createCustomerController } from "./useCases/CreateCustomer";
import { createCustomerMessageController } from "./useCases/CreateCustomerMessage";
import { createLoyaltyRuleController } from "./useCases/CreateLoyaltyRule";
import { createMessageTemplateController } from "./useCases/CreateMessageTemplate";
import { createReferralController } from "./useCases/CreateReferral";
import { createServiceController } from "./useCases/CreateService";
import { createUserController } from "./useCases/CreateUser";
import { deactivateCustomerController } from "./useCases/DeactivateCustomer";
import { deactivateServiceController } from "./useCases/DeactivateService";
import { updateServiceController } from "./useCases/UpdateService";
import { getAppointmentController } from "./useCases/GetAppointment";
import { getCustomerReturnSummaryController } from "./useCases/GetCustomerReturnSummary";
import { getCustomerSummaryController } from "./useCases/GetCustomerSummary";
import { getIndicatorsController } from "./useCases/GetIndicators";
import { getLoyaltyRuleController } from "./useCases/GetLoyaltyRule";
import { getMeController } from "./useCases/GetMe";
import { getMessagePendingCountController } from "./useCases/GetMessagePendingCount";
import { getMessageTemplateController } from "./useCases/GetMessageTemplate";
import { getMessageWhatsAppLinkController } from "./useCases/GetMessageWhatsAppLink";
import { grantManualCustomerRewardController } from "./useCases/GrantManualCustomerReward";
import { listAppointmentsController } from "./useCases/ListAppointments";
import { listCustomerRewardsController } from "./useCases/ListCustomerRewards";
import { listCustomersController } from "./useCases/ListCustomers";
import { listLoyaltyRulesController } from "./useCases/ListLoyaltyRules";
import { listMessagesController } from "./useCases/ListMessages";
import { listOverdueReturnsController } from "./useCases/ListOverdueReturns";
import { listMessageTemplatesController } from "./useCases/ListMessageTemplates";
import { listMonthlyBirthdaysController } from "./useCases/ListMonthlyBirthdays";
import { listReferralsController } from "./useCases/ListReferrals";
import { listServicesController } from "./useCases/ListServices";
import { listUsersController } from "./useCases/ListUsers";
import { markMessageSentController } from "./useCases/MarkMessageSent";
import { previewMessageTemplateController } from "./useCases/PreviewMessageTemplate";
import { setLoyaltyRuleActiveController } from "./useCases/SetLoyaltyRuleActive";
import { setMessageTemplateActiveController } from "./useCases/SetMessageTemplateActive";
import { updateAppointmentController } from "./useCases/UpdateAppointment";
import { updateCustomerController } from "./useCases/UpdateCustomer";
import { updateLoyaltyRuleController } from "./useCases/UpdateLoyaltyRule";
import { updateMessageContentController } from "./useCases/UpdateMessageContent";
import { updateMessageTemplateController } from "./useCases/UpdateMessageTemplate";
import { updateUserController } from "./useCases/UpdateUser";

const router = Router();

router.post("/login", (request, response) => {
	authenticateUserController.handle(request, response);
});

router.use(ensureAuthenticated);

router.get("/me", (request, response) => {
	getMeController.handle(request, response);
});

router.get("/indicators", (request, response) => {
	getIndicatorsController.handle(request, response);
});

router.get("/overdue-returns", (request, response) => {
	listOverdueReturnsController.handle(request, response);
});

router.post("/users", (request, response) => {
	createUserController.handle(request, response);
});

router.get("/users", (request, response) => {
	listUsersController.handle(request, response);
});

router.patch("/users/:id", (request, response) => {
	updateUserController.handle(request, response);
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

router.get("/customers/birthdays", (request, response) => {
	listMonthlyBirthdaysController.handle(request, response);
});

router.post("/customers", (request, response) => {
	createCustomerController.handle(request, response);
});

router.get("/customers/:customerId/summary", (request, response) => {
	getCustomerSummaryController.handle(request, response);
});

router.get("/customers/:customerId/rewards", (request, response) => {
	listCustomerRewardsController.handle(request, response);
});

router.get("/customers/:customerId/return-summary", (request, response) => {
	getCustomerReturnSummaryController.handle(request, response);
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

router.patch("/services/:id", (request, response) => {
	updateServiceController.handle(request, response);
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

router.get("/messages/pending-count", (request, response) => {
	getMessagePendingCountController.handle(request, response);
});

router.get("/messages", (request, response) => {
	listMessagesController.handle(request, response);
});

router.post("/customers/:customerId/messages", (request, response) => {
	createCustomerMessageController.handle(request, response);
});

router.patch("/messages/:id", (request, response) => {
	updateMessageContentController.handle(request, response);
});

router.patch("/messages/:id/sent", (request, response) => {
	markMessageSentController.handle(request, response);
});

router.patch("/messages/:id/cancel", (request, response) => {
	cancelMessageController.handle(request, response);
});

router.get("/messages/:id/whatsapp-link", (request, response) => {
	getMessageWhatsAppLinkController.handle(request, response);
});

export { router };
