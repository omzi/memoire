'use client';

import {
	ImageIcon,
	MusicIcon,
	SettingsIcon,
	MicIcon
} from 'lucide-react';
import { ActivePane } from '#/types';
import SidebarItem from '#/components/project/SidebarItem';

interface SidebarProps {
	activePane: ActivePane;
	onPaneChange: (pane: ActivePane) => void;
};

const Sidebar = ({
	activePane,
	onPaneChange
}: SidebarProps) => {
	return (
		<aside className='bg-white flex flex-col w-[100px] z-30 h-full border-r overflow-y-auto'>
			<div className='flex flex-col m-1.5 space-y-1.5'>
				<SidebarItem
					icon={ImageIcon}
					label='Media'
					isActive={activePane === 'media'}
					onClick={() => onPaneChange('media')}
				/>
				<SidebarItem
					icon={MicIcon}
					label='Narration'
					isActive={activePane === 'narration'}
					onClick={() => onPaneChange('narration')}
				/>
				<SidebarItem
					icon={MusicIcon}
					label='Music'
					isActive={activePane === 'music'}
					onClick={() => onPaneChange('music')}
				/>
				<SidebarItem
					icon={SettingsIcon}
					label='Settings'
					isActive={activePane === 'settings'}
					onClick={() => onPaneChange('settings')}
				/>
			</div>
		</aside>
	);
};

export default Sidebar;
