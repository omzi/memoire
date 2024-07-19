import fs from 'fs';
import path from 'path';
import { compileTemplate } from '#/lib/utils';

interface EmailVariables {
  email: string;
  firstName: string;
  verificationCode: string;
  verifyAccountLink: string;
};

const accountVerificationEmailTemplate = (variables: EmailVariables): string => {
	try {
		const templatePath = path.resolve(process.cwd(), 'lib/emails/templates/accountVerification.handlebars');
		const template = fs.readFileSync(templatePath, 'utf8');
		const compiledHTML = compileTemplate(template, variables);

		return compiledHTML;
	} catch (error) {
		console.error('Error compiling email template [accountVerification]:>>', error);
		return '';
	}
};

export default accountVerificationEmailTemplate;
