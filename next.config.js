/** @type {import('next').NextConfig} */
const nextConfig = {
	skipMiddlewareUrlNormalize: true,
	images: {
		dangerouslyAllowSVG: true,
		domains: ['api.dicebear.com', 'files.edgestore.dev']
	}
};

module.exports = nextConfig;
