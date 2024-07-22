'use client';

import {
	Loader,
	DownloadIcon
} from 'lucide-react';
import { ProjectType } from '#/types';
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '#/components/ui/dropdown-menu';
import Logo from '#/components/project/Logo';
import { useSession } from 'next-auth/react';
import { Button } from '#/components/ui/button';
import UserButton from '#/components/UserButton';
import { Skeleton } from '#/components/ui/skeleton';
import { generateDefaultAvatar } from '#/lib/utils';
import TitleBox from '#/components/project/TitleBox';
import { Separator } from '#/components/ui/separator';
import { useMutationState } from '@tanstack/react-query';
import { StandardDefinition, HighDefinition, FourK, Video } from '@phosphor-icons/react';

interface NavbarProps {
	initialData: ProjectType;
};

export const Navbar = ({
	initialData
}: NavbarProps) => {
	const status = useMutationState({
		filters: {
			mutationKey: [`project-${initialData.id}`],
			exact: true
		},
		select: (mutation) => mutation.state.status
	});
	const { data: session } = useSession();
	const currentStatus = status[status.length - 1];

	const isError = currentStatus === 'error';
	const isPending = currentStatus === 'pending';

	return (
		<nav className='w-full flex items-center p-4 h-[4.5rem] gap-x-8 border-b'>
			<Logo />
			<div className='w-full flex items-center gap-x-1 h-full'>
				<TitleBox initialData={initialData} />
				<Separator orientation='vertical' className='mx-2 h-3/4' />
				{isPending && (
					<div className='flex items-center gap-x-2 select-none'>
						<Loader className='size-5 animate-spin text-muted-foreground' />
						<div className='text-sm text-muted-foreground'>
							Saving...
						</div>
					</div>
				)}
				{!isPending && isError && (
					<div className='flex items-center gap-x-2 select-none'>
						{/* CloudSlash */}
						<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='size-5 text-muted-foreground' viewBox='0 0 16 16'>
							<path fillRule='evenodd' d='M3.112 5.112a3 3 0 0 0-.17.613C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13H11l-1-1H3.781C2.231 12 1 10.785 1 9.318c0-1.365 1.064-2.513 2.46-2.666l.446-.05v-.447q0-.113.018-.231zm2.55-1.45-.725-.725A5.5 5.5 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773a3.2 3.2 0 0 1-1.516 2.711l-.733-.733C14.498 11.378 15 10.626 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3c-.875 0-1.678.26-2.339.661z' />
							<path d='m13.646 14.354-12-12 .708-.708 12 12z' />
						</svg>
						<div className='text-sm text-muted-foreground'>
							Failed to save
						</div>
					</div>
				)}
				{!isPending && !isError && (
					<div className='flex items-center gap-x-2 select-none'>
						{/* CloudCheck */}
						<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='size-5 text-muted-foreground' viewBox='0 0 16 16'>
							<path fillRule='evenodd' d='M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0' />
							<path d='M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z' />
						</svg>
						<div className='text-sm text-muted-foreground'>
							Saved
						</div>
					</div>
				)}
				<div className='pr-1' />
				<div className='ml-auto flex items-center gap-x-4'>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button size='sm' className='bg-black hover:bg-core text-white'>
								<DownloadIcon className='size-4 mr-2' />
								Download Video
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='min-w-48'>
							<DropdownMenuItem
								className='flex items-center gap-x-2 cursor-pointer'
								onClick={() => {}}
							>
								<FourK className='size-8' />
								<div>
									<p className='font-medium leading-none'>4K (UHD)</p>
									<p className='text-xs text-muted-foreground italic'>
										For large screens
									</p>
								</div>
							</DropdownMenuItem>
							<Separator orientation='horizontal' className='my-0.5 w-[calc(100%-8px)] mx-auto' />
							<DropdownMenuItem
								className='flex items-center gap-x-2 cursor-pointer'
								onClick={() => {}}
							>
								<Video className='size-8' />
								<div>
									<p className='font-medium leading-none'>1080P</p>
									<p className='text-xs text-muted-foreground italic'>
										For streaming
									</p>
								</div>
							</DropdownMenuItem>
							<Separator orientation='horizontal' className='my-0.5 w-[calc(100%-8px)] mx-auto' />
							<DropdownMenuItem
								className='flex items-center gap-x-2 cursor-pointer'
								onClick={() => {}}
							>
								<HighDefinition className='size-8' />
								<div>
									<p className='font-medium leading-none'>720P</p>
									<p className='text-xs text-muted-foreground italic'>
										For social media
									</p>
								</div>
							</DropdownMenuItem>
							<Separator orientation='horizontal' className='my-0.5 w-[calc(100%-8px)] mx-auto' />
							<DropdownMenuItem
								className='flex items-center gap-x-2 cursor-pointer'
								onClick={() => {}}
							>
								<StandardDefinition className='size-8' />
								<div>
									<p className='font-medium leading-none'>480P</p>
									<p className='text-xs text-muted-foreground italic'>
										For drafts
									</p>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					
					{!session ? (
						<Skeleton className='w-10 h-10 rounded-full' />
					) : (
						<UserButton
							profilePicture={session.user.image || generateDefaultAvatar(`${session.user.email}`)}
							profilePictureAlt={`${session.user.name}'s Profile Picture`}
							fullName={`${session.user.name}`}
							email={`${session.user.email}`}
						/>
					)}
				</div>
			</div>
		</nav>
	);
};
