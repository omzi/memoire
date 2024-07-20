import { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => {
	return {
		name: 'Memoire',
		short_name: 'Memoire',
		description: '✨ Create stunning narrated videos from your photos & videos using AI.',
		start_url: '/home',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ffffff',
		icons: [
			{
				src: '/favicon.ico',
				sizes: '64x64 32x32 24x24 16x16',
				type: 'image/x-icon'
			},
			{
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
		]
	};
};

export default manifest;
