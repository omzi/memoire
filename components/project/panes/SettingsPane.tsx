'use client';

import { cn } from '#/lib/utils';
import { ActivePane } from '#/types';
import SidebarPaneHeader from '#/components/project/SidebarPaneHeader';
import SidebarPaneCloseButton from '#/components/project/SidebarPaneCloseButton';

interface SettingsPaneProps {
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const SettingsPane = ({
	activePane,
	onPaneChange
}: SettingsPaneProps) => {
	const onClose = () => {
		onPaneChange(null);
	};

	return (
		<aside
			className={cn(
				'bg-white relative border-r z-20 w-[360px] h-full flex flex-col',
				activePane === 'settings' ? 'visible' : 'hidden'
			)}
		>
			<SidebarPaneHeader
				title='Settings'
				description='Customize your project settings & preferences.'
			/>
			<div className='p-3 flex-1 scrollbar-thin overflow-y-auto'>
				
			</div>
			<SidebarPaneCloseButton pane='settings' activePane={activePane} onClick={onClose} />
		</aside>
	);
};

export default SettingsPane;
