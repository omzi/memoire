'use server';

import config from '#/lib/config';
import validator from 'validator';
import { getUserByEmail } from '#/lib/data/user';
import { sendPasswordResetEmail } from '#/lib/emails/mail';
import { generatePasswordResetToken } from '#/lib/data/tokens';

const requestPasswordResetToken = async (email: string) => {
	const isEmailValid = validator.isEmail(email);
  if (!isEmailValid) {
    return { error: 'Invalid email!' };
  }
	
	// Check if the email is valid
	const user = await getUserByEmail(email);
	if (!user) {
		return { error: 'Email does not exist!' };
	}

	const { token } = await generatePasswordResetToken(email);
  const [firstName] = `${user.name}`.split(' ');
	const passwordResetLink = `${config.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
	
  await sendPasswordResetEmail({
    email,
    name: `${user.name}`,
    firstName,
    passwordResetLink
  });

	return { success: 'Password reset link sent successfully! Please check your inbox.' };
};

export default requestPasswordResetToken;
