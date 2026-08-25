export {
  isResendConfigured,
  resolveResendConfig,
  type ResendConfig,
} from "./config";
export {
  isAuthorizedEmailRecipient,
  normalizeEmailRecipient,
} from "./recipient";
export {
  sendTransactionalEmail,
  type SendEmailInput,
  type SendEmailResult,
} from "./resend";
export {
  renderMasterEmailHtml,
  sendMasterTransactionalEmail,
  EMAIL_BRAND_ORANGE,
  type MasterEmailVars,
  type SendMasterEmailInput,
} from "./master-template";
