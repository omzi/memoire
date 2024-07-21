'use client';

import { useState } from 'react';
import { ProjectType } from '#/types';
import { useDebounceCallback } from 'usehooks-ts'
import { useMutation } from '@tanstack/react-query';
import { renameProject } from '#/lib/actions/mutations';

interface TitleBoxProps {
	initialData: ProjectType;
};

const TitleBox = ({
	initialData
}: TitleBoxProps) => {
	const [value, setValue] = useState(initialData.title);
	const { mutate: renameProjectMutation } = useMutation({
		mutationKey: [`project-${initialData.id}`],
		mutationFn: async ({ id, title }: { id: string, title: string }) => {
			try {
				const project = await renameProject({ id, title });

				return project;
			} catch (error) {
				throw error;
			}
		}
	});

	const debouncedRename = useDebounceCallback(renameProjectMutation, 500);

	const onInput = (value: string) => {
		setValue(value);
		if (!value.trim()) return;

		const data = { id: initialData.id, title: value };
		
		debouncedRename(data);
	};

	return (
		<div className='relative flex-1 max-w-60 border border-gray-300/50 rounded-md px-1.5 py-1 shadow-sm focus-within:ring-1 focus-within:ring-indigo-600 focus-within:border-indigo-600'>
			<label htmlFor='title' className='absolute -top-2 left-2 -mt-px inline-block px-1 select-none bg-white text-xs uppercase font-medium text-gray-900'>
				Title
			</label>
			<input
				type='text'
				id='title'
				value={value}
				autoComplete='off'
				placeholder='Untitled'
				onChange={e => onInput(e.target.value)}
				className='block w-full border-0 p-0 h-7 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm'
			/>
		</div>
	)
}

export default TitleBox;
