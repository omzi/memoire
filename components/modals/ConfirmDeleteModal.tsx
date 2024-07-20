'use client';

import { cn } from '#/lib/utils';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogClose,
	DialogFooter
} from '#/components/ui/dialog';
import { MouseEvent } from 'react';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { deleteProject } from '#/lib/actions/mutations';
import { useConfirmDelete } from '#/hooks/useConfirmDelete';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ConfirmDeleteModal = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isOpen, onClose, initialValues } = useConfirmDelete();
	const { mutate: deleteProjectMutation, isPending: deleteProjectLoading } = useMutation({
		mutationFn: async (projectId: string) => {
			try {
				const project = await deleteProject(projectId);

				console.log('Delete Project Mutation :>>', project);
				return project;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('deleteProject Error :>>', error);
			toast.error('Failed to delete project ;(');
			onClose();
		},
		onSuccess: () => {
			toast.success('Project deleted!');
			onClose();

			queryClient.invalidateQueries({ queryKey: ['userProjects'] });

			router.push('/home');
		}
	});

	const onConfirm = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		deleteProjectMutation(initialValues.id);
	};

	const handleModalClose = () => {
		if (deleteProjectLoading) return;

		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleModalClose}>
			<DialogContent showCloseButton={false} className='rounded-lg w-[calc(100%-20px)] sm:w-[24rem] md:w-[30rem]'>
				<DialogHeader>
					<div className='sm:flex sm:items-start'>
						<div className='flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10'>
							<AlertTriangle className='w-6 h-6 text-red-600' />
						</div>
						<div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
							<h3 className='text-base font-semibold leading-6 text-gray-900 dark:text-gray-100'>
								Delete project?
							</h3>
							<div className='mt-2'>
								<p className='text-sm text-gray-500'>
									Proceeding with this action will permanently delete the project & all of its associated content. Are you sure you want to proceed with deleting the project & its contents?
								</p>
							</div>
						</div>
					</div>
				</DialogHeader>
				<DialogFooter>
					<div className='flex justify-center gap-x-4 sm:justify-end'>
						<DialogClose asChild>
							<Button type='button' variant='outline'>Cancel</Button>
						</DialogClose>
						<Button type='button' className='relative' disabled={deleteProjectLoading} onClick={onConfirm}>
							<span className={cn('opacity-100 flex items-center', deleteProjectLoading && 'opacity-0')}>
								Confirm
							</span>
							{deleteProjectLoading && (
								<div className='absolute flex items-center justify-center w-full h-full'>
									<Loader type='spinner' size={28} className='text-white leading-[0]' />
								</div>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteModal;
