import fs from 'fs';
import path from 'path';
import config from '#/lib/config';
import { compileTemplate } from '#/lib/utils';

interface EmailVariables {
  email: string;
  firstName: string;
  passwordResetLink: string;
};

const passwordResetEmailTemplate = (variables: EmailVariables): string => {
	try {
		let template = '';
		if (config.IS_PRODUCTION) {
			template = config.EMAIL_PASSWORD_RESET;
		} else {
			const templatePath = path.resolve(process.cwd(), 'lib/emails/templates/passwordReset.handlebars');
			template = fs.readFileSync(templatePath, 'utf8');
		}

		const compiledHTML = compileTemplate(template, variables);

		return compiledHTML;
	} catch (error) {
		console.error('Error compiling email template [passwordReset]:>>', error);
		return '';
	}
};

export default passwordResetEmailTemplate;
