import { create } from 'zustand';

const defaultValues = { id: '' };

interface IConfirmDelete {
	isOpen: boolean;
	initialValues: typeof defaultValues;
	onOpen: (id: string) => void;
	onClose: () => void;
};

export const useConfirmDelete = create<IConfirmDelete>((set) => ({
	isOpen: false,
	onOpen: (id) => set({
		isOpen: true,
		initialValues: { id }
	}),
	onClose: () => set({
		isOpen: false,
		initialValues: defaultValues
	}),
	initialValues: defaultValues
}));
