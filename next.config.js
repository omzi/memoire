/** @type {import('next').NextConfig} */
const nextConfig = {
	skipMiddlewareUrlNormalize: true,
	images: {
		dangerouslyAllowSVG: true,
		domains: ['api.dicebear.com']
	}
};

module.exports = nextConfig;
