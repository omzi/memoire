'use client';

import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger
} from '#/components/ui/dropdown-menu';
import { useLogOut } from '#/hooks/useLogOut';
import { HelpCircleIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Skeleton } from '#/components/ui/skeleton';
import { MouseEvent as ReactMouseEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';

interface UserButtonProps {
	profilePicture: string;
	profilePictureAlt: string;
	fullName: string;
	email: string;
};

const UserButton = ({
	profilePicture,
	profilePictureAlt,
	fullName,
	email
}: UserButtonProps) => {
	const { onOpen } = useLogOut();
	const handleLogOutClick = (e: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
		onOpen();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative w-10 h-10 rounded-full'>
					<Avatar className='w-10 h-10'>
						<AvatarImage src={profilePicture} alt={profilePictureAlt} />
						<AvatarFallback>
							<Skeleton className='w-10 h-10 rounded-full' />
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1 gap-2'>
						<p className='text-base font-medium leading-none'>{fullName}</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link href='/profile'>
						<DropdownMenuItem>Profile</DropdownMenuItem>
					</Link>
					<Link href='mailto:obiohaomezibe+memoire@gmail.com?subject=%5BMemoire%20Email%20Inquiry%5D&body=Good%20day%2C%20Memoire%20staff.%20Please%20I%20need%20help%20with%20something.%0A%0A' target='_blank'>
						<DropdownMenuItem>
							Help
							<DropdownMenuShortcut>
								<HelpCircleIcon size={16} />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogOutClick}>
					Log Out
					<DropdownMenuShortcut className='opacity-100'>
						<kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
							<span className='text-xs'>⌘</span>L
						</kbd>
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserButton;
