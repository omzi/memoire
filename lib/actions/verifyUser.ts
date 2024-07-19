'use server';

import prisma from '#/lib/prisma';
import { getUserByEmail } from '#/lib/data/user';
import { getVerificationCodeByCode } from '#/lib/data/verificationCode';

const verifyUser = async (code: string) => {
	// Check if the OTP is valid
	const existingCode = await getVerificationCodeByCode(code);
	if (!existingCode) {
		return { error: 'Invalid OTP!' };
	}

	const hasCodeExpired = new Date(existingCode.expires) < new Date();
	if (hasCodeExpired) {
		return { error: 'OTP has expired! Please request a new code.' };
	}
	
	// Check if the token is valid
	const user = await getUserByEmail(existingCode.email);
	if (!user) {
		return { error: 'Email does not exist!' };
	}

	if (user.emailVerified) {
		return { error: 'Email has already been verified!' };
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { emailVerified: new Date() }
	});

	await prisma.verificationCode.delete({
		where: { id: existingCode.id }
	});
	
	// TODO: Send welcome email
	// 	await sendBrevoEmail({
  //   sender: { email: 'notifications@memoire.com', name: 'Memoire' },
  //    to: [{ email, name: `${user.name}` }],
  //    subject: 'Welcome to Memoire account 🔐',
  //    htmlContent: accountVerificationEmailTemplate({
  //      email,
  //      firstName,
  //      verificationCode: code
  //    })
  //  });

	return { success: 'Email verified successfully! Please sign in to proceed.' };
};

export default verifyUser;
