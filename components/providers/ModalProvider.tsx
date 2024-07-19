'use client';

import { useEffect, useState } from 'react';
import LogOutModal from '#/components/modals/LogOutModal';

export const ModalProvider = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<>
			<LogOutModal />
		</>
	);
};
