'use client';

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem
} from '#/components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import { blurActiveElement } from '#/lib/utils';
import { Link2, Pencil, Trash2 } from 'lucide-react';
import { useRenameModal } from '#/hooks/useRenameModal';
import { useConfirmDelete } from '#/hooks/useConfirmDelete';
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';

interface ProjectActionsProps {
	children: React.ReactNode;
	side?: DropdownMenuContentProps['side'];
	align?: DropdownMenuContentProps['align'];
	sideOffset?: DropdownMenuContentProps['sideOffset'];
	id: string;
	title: string;
}

const ProjectActions = ({
	children,
	side,
	align,
	sideOffset,
	id,
	title
}: ProjectActionsProps) => {
	const { onOpen: openRenameModal } = useRenameModal();
	const { onOpen: openConfirmDeleteModal } = useConfirmDelete();

	const handleCopy = () => {
		blurActiveElement();

		navigator.clipboard.writeText(`${location.origin}/project/${id}`)
			.then(() => toast.success('Link copied to clipboard!'))
			.catch(() => toast.error('Failed to copy link ;('));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{children}
			</DropdownMenuTrigger>
			<DropdownMenuContent side={side} sideOffset={sideOffset} align={align} className='w-60' onClick={e => e.stopPropagation()}>
				<DropdownMenuItem onClick={handleCopy} className='py-1.5 px-2 cursor-pointer'>
					<Link2 className='h-4 w-4 mr-2' />
					Copy project link
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => openRenameModal(id, title)} className='py-1.5 px-2 cursor-pointer'>
					<Pencil className='h-4 w-4 mr-2' />
					Rename
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => openConfirmDeleteModal(id)} className='py-1.5 px-2 cursor-pointer'>
					<Trash2 className='h-4 w-4 mr-2' />
					Delete
				</DropdownMenuItem>
				{/* <DropdownMenuItem disabled={deleteProjectLoading} onClick={handleDelete} className='py-1.5 px-2 cursor-pointer'>
					{deleteProjectLoading ? <>
						<Loader type='spinner' size={20} className='text-black leading-[0] mr-2' />
						Deleting...
					</> : <>
						<Trash2 className='h-4 w-4 mr-2' />
						Delete
					</>}
				</DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ProjectActions;
