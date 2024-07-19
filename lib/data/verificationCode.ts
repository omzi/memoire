import prisma from '#/lib/prisma';

export const getVerificationCodeByCode = async (code: string) => {
  try {
    const verificationCode = await prisma.verificationCode.findUnique({ where: { code } });

    return verificationCode;
  } catch (error) {
    return null;
  }
};

export const getVerificationCodeByEmail = async (email: string) => {
  try {
    const verificationCode = await prisma.verificationCode.findFirst({ where: { email } });

    return verificationCode;
  } catch (error) {
    return null;
  }
};
