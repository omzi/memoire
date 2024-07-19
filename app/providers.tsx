'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { EdgeStoreProvider } from '#/lib/edgestore';
import { ThemeProvider } from '#/components/providers/ThemeProvider';
import { ModalProvider } from '#/components/providers/ModalProvider';

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<SessionProvider>
			<ThemeProvider attribute='class' defaultTheme='light' storageKey='theme' enableSystem disableTransitionOnChange>
				<EdgeStoreProvider>
					<ModalProvider />
					{children}
				</EdgeStoreProvider>
			</ThemeProvider>
		</SessionProvider>
	)
}

export default Providers;
