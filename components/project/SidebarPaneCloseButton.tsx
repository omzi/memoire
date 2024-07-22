import { cn } from '#/lib/utils';
import { ActivePane } from '#/types';
import { ChevronLeftIcon } from 'lucide-react';

interface SidebarPaneCloseButtonProps {
	pane: ActivePane;
	activePane: ActivePane;
	onClick: () => void;
};

const SidebarPaneCloseButton = ({
	pane,
	activePane,
	onClick
}: SidebarPaneCloseButtonProps) => {
	return (
		<button
			onClick={onClick}
			className={cn(
				'absolute -right-[12.5px] top-1/2 transform -translate-y-1/2 flex items-center justify-center group',
				pane !== activePane && 'hidden'
			)}
		>
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 96' width='13' height='96' fill='none'>
				<path className='fill-white' d='M0,0 h1 c0,20,12,12,12,32 v32 c0,20,-12,12,-12,32 H0 z'></path>
				<path className='stroke-border' d='M0.5,0 c0,20,12,12,12,32 v32 c0,20,-12,12,-12,32'></path>
			</svg>
			<ChevronLeftIcon className='absolute size-3.5 mr-1 text-muted-foreground group-hover:opacity-75 transition' />
		</button>
	);
};

export default SidebarPaneCloseButton;
