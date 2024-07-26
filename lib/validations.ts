import * as z from 'zod';
import validator from 'validator';

const generateErrorMessages = (fieldName: string) => {
  return {
    invalid_type_error:  `Please enter a valid ${fieldName}`,
    required_error:  `Your ${fieldName} is required`
  }
};

export const AuthSchema = z.object({
	email: z.string(generateErrorMessages('email address'))
		.refine(value => value && validator.isEmail(value), {
			message: 'Invalid email address'
		}),
	password: z.string(generateErrorMessages('password'))
		.refine(value => {
			return value && value.length >= 8 && /\d/.test(value) && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
		}, {
			message: 'Password must have at least one lowercase character, one uppercase character, one digit, one special character, and be at least 8 characters long'
		}),
	firstName: z.string(generateErrorMessages('first name'))
		.refine(value => value && value.length >= 2, 'First name must be at least 2 characters.')
		.refine(value => value && value.length <= 30, 'First name must not be more than 30 characters.'),
	lastName: z .string(generateErrorMessages('last name'))
		.refine(value => value && value.length >= 2, 'Last name must be at least 2 characters.')
		.refine(value => value && value.length <= 30, 'Last name must not be more than 30 characters.')
});

export const NarrationMediaItem = z.object({
	id: z.string(),
	type: z.enum(['VIDEO', 'PHOTO']),
	text: z.string()
});

export const NarrationGenerationSchema = z.object({
	title: z.string(),
  deescription: z.string(),
  hashtags: z.array(z.string()),
  mediaItems: z.array(NarrationMediaItem)
});
