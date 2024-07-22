'use client';

import { cn } from '#/lib/utils';
import { ActivePane } from '#/types';
import { ScrollArea } from '#/components/ui/scroll-area';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';

interface NarrationPaneProps {
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const NarrationPane = ({
	activePane,
	onPaneChange
}: NarrationPaneProps) => {
	const onClose = () => {
		onPaneChange(null);
	};

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'narration' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Narration'
				description='Create, reviews & update the AI-generated narration.'
			/>
			<ScrollArea>

			</ScrollArea>
			<SidebarPaneCloseButton pane='narration' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default NarrationPane;
