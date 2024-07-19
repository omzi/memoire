'use server';

import config from '#/lib/config';
import validator from 'validator';
import { getUserByEmail } from '#/lib/data/user';
import { generateVerificationCode } from '#/lib/data/tokens';
import { sendAccountVerificationEmail } from '#/lib/emails/mail';

const requestVerificationCode = async (email: string) => {
	const isEmailValid = validator.isEmail(email);
	if (!isEmailValid) {
		return { error: 'Invalid email!' };
	}

	// Check if the email is valid
	const user = await getUserByEmail(email);
	if (!user) {
		return { error: 'Email does not exist!' };
	}

	if (user.emailVerified) {
		return { error: 'Email has already been verified!' };
	}

	const { code } = await generateVerificationCode(email);
  const [firstName] = `${user.name}`.split(' ');
	const verifyAccountLink = `${config.NEXTAUTH_URL}/auth/verify-account?email=${email}`;
	
	await sendAccountVerificationEmail({
		email,
		name: `${user.name}`,
		firstName,
		verifyAccountLink,
		verificationCode: code
	});

	return { success: 'OTP resent successfully! Please check your inbox.' };
};

export default requestVerificationCode;
