'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '#/lib/prisma';
import { AuthSchema } from '#/lib/validations';
import { getUserByEmail } from '#/lib/data/user';
import { sendPasswordResetEmail } from '#/lib/emails/mail';
import { getPasswordResetTokenByToken } from '#/lib/data/passwordResetToken';

const NewPasswordSchema = AuthSchema.pick({
	password: true
});

const setNewPassword = async (data: z.infer<typeof NewPasswordSchema>, token?: string | null) => {
	if (!token) {
		return { error: 'Missing token!' };
	}

  const validatedFields = NewPasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
	
  const { password } = validatedFields.data;

  // Check if the email is valid
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: 'Invalid token!' };
  }
	
	const hasTokenExpired = new Date(existingToken.expires) < new Date();
	if (hasTokenExpired) {
		return { error: 'Token has expired!' };
	}

	const user = await getUserByEmail(existingToken.email);
  if (!user) {
    return { error: 'Email does not exist!' };
  }

	const hashedPassword = await bcrypt.hash(password, 12);
	await prisma.user.update({
		where: { id: user.id },
    data: { password: hashedPassword }
  });

	await prisma.passwordResetToken.delete({
		where: { id: existingToken.id }
	});

  return { success: 'Password changed successfully!' };
};

export default setNewPassword;
