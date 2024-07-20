import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '#/components/ui/tooltip';
import { ReactNode } from 'react';

export interface TooltipHintProps {
	label: string;
	children: ReactNode;
	side?: 'top' | 'bottom' | 'left' | 'right';
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
	alignOffset?: number;
}

const TooltipHint = ({
	label,
	children,
	side,
	align,
	sideOffset,
	alignOffset
}: TooltipHintProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					{children}
				</TooltipTrigger>
				<TooltipContent
					className='text-white bg-black border-black'
					side={side}
					align={align}
					sideOffset={sideOffset}
					alignOffset={alignOffset}
				>
					<p className='font-base capitalize'>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

export default TooltipHint;
