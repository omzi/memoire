'use server';

import config from '#/lib/config';
import validator from 'validator';
import { getUserByEmail } from '#/lib/data/user';
import { generateVerificationCode } from '#/lib/data/tokens';
import { sendAccountVerificationEmail } from '#/lib/emails/mail';

const checkUserVerification = async (email: string) => {
	const isEmailValid = validator.isEmail(email);
  if (!isEmailValid) {
    return { error: 'Invalid email!' };
  }

	// Check if the user already exists
	const user = await getUserByEmail(email);
	if (!user) {
		return { error: 'Invalid credentials!' };
	}

	if (!user.password) {
		return { error: 'You have not set your password yet. Please sign in using your Google account.' };
	}

	if (!user.emailVerified) {
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

		return { success: 'A verification OTP has been sent to your email! Please check your inbox.', verify: true };
	}

	return { verify: false };
};

export default checkUserVerification;
