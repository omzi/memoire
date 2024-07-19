import prisma from '#/lib/prisma';
import { getVerificationCodeByEmail } from '#/lib/data/verificationCode';
import { generateOneTimePassword, generateRandomChars } from '#/lib/utils';
import { getPasswordResetTokenByEmail } from '#/lib/data/passwordResetToken';

export const generateVerificationCode = async (email: string) => {
	const existingCode = await getVerificationCodeByEmail(email);
	if (existingCode) {
		await prisma.verificationCode.delete({
			where: { id: existingCode.id }
		});
	}

	const code = generateOneTimePassword(6);
	const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // Expires in 15 minutes

	const verificationCode = await prisma.verificationCode.create({
		data: { email, code, expires }
	});

	return verificationCode;
};

export const generatePasswordResetToken = async (email: string) => {
	const existingToken = await getPasswordResetTokenByEmail(email);
	if (existingToken) {
		await prisma.passwordResetToken.delete({
			where: { id: existingToken.id }
		});
	}

	const token = generateRandomChars(36, ...generateRandomChars.alphanumeric);
	const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // Expires in 15 minutes

	const passwordResetToken = await prisma.passwordResetToken.create({
		data: { email, token, expires }
	});

	return passwordResetToken;
};
