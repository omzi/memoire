import fs from 'fs';
import path from 'path';
import config from '#/lib/config';
import { compileTemplate } from '#/lib/utils';

interface EmailVariables {
  email: string;
  firstName: string;
  verificationCode: string;
  verifyAccountLink: string;
};

const accountVerificationEmailTemplate = (variables: EmailVariables): string => {
	try {
		let template = '';
		if (config.IS_PRODUCTION) {
			template = config.EMAIL_ACCOUNT_VERIFICATION;
		} else {
			const templatePath = path.resolve(process.cwd(), 'lib/emails/templates/accountVerification.handlebars');
			template = fs.readFileSync(templatePath, 'utf8');
		}

		const compiledHTML = compileTemplate(template, variables);

		return compiledHTML;
	} catch (error) {
		console.error('Error compiling email template [accountVerification]:>>', error);
		return '';
	}
};

export default accountVerificationEmailTemplate;
