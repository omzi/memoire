'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '#/lib/prisma';
import config from '#/lib/config';
import { AuthSchema } from '#/lib/validations';
import { getUserByEmail } from '#/lib/data/user';
import { generateVerificationCode } from '#/lib/data/tokens';
import { sendAccountVerificationEmail } from '#/lib/emails/mail';

const handleSignUp = async (data: z.infer<typeof AuthSchema>) => {
  const validatedFields = AuthSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, firstName, lastName } = validatedFields.data;

  try {
    // Check if the email already exists
    const existingUser = await getUserByEmail(`${email}`);
    if (existingUser) {
      return { error: 'Email already in use! Please use a different email.' };
    }
  
    const hashedPassword = await bcrypt.hash(`${password}`, 12);
  
    await prisma.user.create({
      data: { email, name: `${firstName} ${lastName}`, password: hashedPassword }
    });

    // TODO: Send verification token email...
    const { code } = await generateVerificationCode(`${email}`);
    const verifyAccountLink = `${config.NEXTAUTH_URL}/auth/verify-account?email=${email}`;

		await sendAccountVerificationEmail({
			email: `${email}`,
			name: `${firstName} ${lastName}`,
			firstName: `${firstName}`,
			verifyAccountLink,
			verificationCode: code
		});
  
    return { success: 'Account created successfully!' };
  } catch (error) {
    return { error: 'An error occurred while signing up ;(' };
  }
};

export default handleSignUp;
