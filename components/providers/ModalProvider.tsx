'use client';

import { useEffect, useState } from 'react';
import LogOutModal from '#/components/modals/LogOutModal';
import RenameModal from '#/components/modals/RenameModal';
import ConfirmDeleteModal from '#/components/modals/ConfirmDeleteModal';

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
			<RenameModal />
			<ConfirmDeleteModal />
		</>
	);
};
