import config from '#/lib/config';
import sendBrevoEmail from '#/lib/emails/transport';
import passwordResetEmailTemplate from '#/lib/emails/templates/passwordReset';
import accountVerificationEmailTemplate from '#/lib/emails/templates/accountVerification';

const SENDER = {
	email: config.SENDER_EMAIL,
	name: config.SENDER_NAME
};

interface EmailProps {
	email: string;
	name: string;
	firstName: string;
};

interface SendAccountVerificationEmailProps extends EmailProps {
	verifyAccountLink: string;
	verificationCode: string;
};

interface SendPasswordResetEmailProps extends EmailProps {
	passwordResetLink: string;
};

export const sendAccountVerificationEmail = async ({
	email,
	name,
	firstName,
	verifyAccountLink,
	verificationCode
}: SendAccountVerificationEmailProps) => {
	return await sendBrevoEmail({
		sender: { email: SENDER.email, name: SENDER.name },
		to: [{ email, name }],
		subject: 'Verify your Memoire account 🔐',
		htmlContent: accountVerificationEmailTemplate({
			email,
			firstName,
			verifyAccountLink,
			verificationCode
		})
	});
};

export const sendPasswordResetEmail = async ({
	email,
	name,
	firstName,
	passwordResetLink
}: SendPasswordResetEmailProps) => {
	return await sendBrevoEmail({
		sender: { email: SENDER.email, name: SENDER.name },
		to: [{ email, name }],
		subject: 'Reset your Memoire account password 🔑',
		htmlContent: passwordResetEmailTemplate({
			email,
			firstName,
			passwordResetLink
		})
	});
};
