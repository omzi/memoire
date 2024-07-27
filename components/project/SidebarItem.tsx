import { cn } from '#/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';

interface SidebarItemProps {
	icon: LucideIcon;
	label: string;
	isActive?: boolean;
	onClick: () => void;
};

const SidebarItem = ({
	icon: Icon,
	label,
	isActive,
	onClick
}: SidebarItemProps) => {
	return (
		<Button
			variant='ghost'
			onClick={onClick}
			className={cn(
				'w-full h-full aspect-video px-3 py-2 flex flex-col rounded-lg duration-150',
				isActive && 'bg-core text-white hover:bg-core hover:text-white shadow-md'
			)}
		>
			<Icon className='size-6 stroke-[1.5] shrink-0' />
			<span className='mt-2 text-sm'>
				{label}
			</span>
		</Button>
	);
};

export default SidebarItem;
