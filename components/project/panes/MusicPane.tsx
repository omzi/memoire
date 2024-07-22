'use client';

import { cn } from '#/lib/utils';
import { ActivePane } from '#/types';
import { ScrollArea } from '#/components/ui/scroll-area';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';

interface MusicPaneProps {
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const MusicPane = ({
	activePane,
	onPaneChange
}: MusicPaneProps) => {
	const onClose = () => {
		onPaneChange(null);
	};

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'music' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Music'
				description='Generate background music for your project with AI.'
			/>
			<ScrollArea>

			</ScrollArea>
			<SidebarPaneCloseButton pane='music' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default MusicPane;
