'use client';


import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
	DialogFooter,
	DialogDescription
} from '#/components/ui/dialog';
import { cn } from '#/lib/utils';
import { Pen } from 'lucide-react';
import Loader from 'react-ts-loaders';
import { toast } from 'react-toastify';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import { useRenameModal } from '#/hooks/useRenameModal';
import { renameProject } from '#/lib/actions/mutations';
import { FormEventHandler, useEffect, useState } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const RenameModal = () => {
	const queryClient = useQueryClient();
	const { isOpen, onClose, initialValues } = useRenameModal();
	const [title, setTitle] = useState(initialValues.title);
	const { mutate: renameProjectMutation, isPending: renameProjectLoading } = useMutation({
		mutationFn: async ({ id, title }: { id: string, title: string }) => {
			try {
				const project = await renameProject({ id, title: title.trim() });
				
				return project;
			} catch (error) {
				throw error;
			}
		},
		onError: (error) => {
			console.log('renameProject Error :>>', error);
			toast.error('Failed to rename project ;(');
			onClose();
		},
		onSuccess: (response) => {
			toast.success('Project renamed!');
			onClose();

			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: [`project-${response.id}`] });
		}
	});

	useEffect(() => {
		setTitle(initialValues.title);
	}, [initialValues.title]);

	const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();

		renameProjectMutation({ id: initialValues.id, title });
	};

	const handleModalClose = () => {
		if (renameProjectLoading) return;

		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleModalClose}>
			<DialogContent showCloseButton={false} className='rounded-lg w-[calc(100%-20px)] sm:w-[24rem] md:w-[30rem]'>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<div className='sm:flex sm:items-start'>
							<div className='flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10'>
								<Pen className='w-6 h-6 text-blue-600' />
							</div>
							<div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1'>
								<DialogTitle className='text-base font-semibold leading-6 text-gray-900 dark:text-gray-100'>Edit project title</DialogTitle>
								<DialogDescription>
									<VisuallyHidden.Root>
										Edit project title
									</VisuallyHidden.Root>
								</DialogDescription>
								<div className='my-2'>
									<Input
										disabled={renameProjectLoading}
										required
										maxLength={60}
										value={title}
										onChange={e => setTitle(e.target.value)}
										placeholder='Project title'
									/>
								</div>
							</div>
						</div>
					</DialogHeader>
					<DialogFooter>
						<div className='flex justify-center gap-x-4 sm:justify-end'>
							<DialogClose asChild>
								<Button type='button' variant='outline'>Cancel</Button>
							</DialogClose>
							<Button type='submit' className='relative' disabled={renameProjectLoading}>
								<span className={cn('opacity-100 flex items-center', renameProjectLoading && 'opacity-0')}>
									Save
								</span>
								{renameProjectLoading && (
									<div className='absolute flex items-center justify-center w-full h-full'>
										<Loader type='spinner' size={28} className='text-white leading-[0]' />
									</div>
								)}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default RenameModal;
