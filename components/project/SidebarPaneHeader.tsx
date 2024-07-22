interface SidebarPaneHeaderProps {
	title: string;
	description?: string;
};

const SidebarPaneHeader = ({
	title,
	description
}: SidebarPaneHeaderProps) => {
	return (
		<div className='p-3 border-b space-y-1 h-[4.75rem]'>
			<p className='text-base font-medium'>
				{title}
			</p>
			{description && (
				<p className='text-sm text-muted-foreground'>
					{description}
				</p>
			)}
		</div>
	);
};

export default SidebarPaneHeader;
