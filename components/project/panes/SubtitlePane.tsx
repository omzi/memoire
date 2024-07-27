'use client';

import { cn } from '#/lib/utils';
import { ActivePane } from '#/types';
import ComingSoonSection from '#/components/ComingSoonSection';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';

interface SubtitlePaneProps {
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const SubtitlePane = ({
	activePane,
	onPaneChange
}: SubtitlePaneProps) => {
	const onClose = () => {
		onPaneChange(null);
	};

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'subtitle' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Subtitle'
				description='Generate narration subtitle for your project with AI.'
			/>
			<div className='p-3 flex-1 scrollbar-thin overflow-y-auto overflow-x-hidden'>
				<ComingSoonSection isHome={false} />
			</div>
			<SidebarPaneCloseButton pane='subtitle' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default SubtitlePane;
