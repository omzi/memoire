import {
	JSONValue,
	RequestOptions,
	UseCompletionOptions,
	callCompletionApi
} from '@ai-sdk/ui-utils';
import useSWR from 'swr';
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useId, useRef, useState } from 'react';

export type { UseCompletionOptions };

export type UseCompletionHelpers = {
	/** The current completion result */
	completion: string;
	/**
	 * Trigger a completion request with an optional prompt.
	 */
	trigger: (prompt?: string, options?: RequestOptions) => Promise<string | null | undefined>;
	/** The error object of the API request */
	error: undefined | Error;
	/**
	 * Abort the current API request but keep the generated tokens.
	 */
	stop: () => void;
	/**
	 * Update the `completion` state locally.
	 */
	setCompletion: (completion: string) => void;
	/** The current value of the input */
	input: string;
	/** setState-powered method to update the input value */
	setInput: Dispatch<SetStateAction<string>>;
	/**
	 * An input/textarea-ready onChange handler to control the value of the input
	 * @example
	 * ```jsx
	 * <input onChange={handleInputChange} value={input} />
	 * ```
	 */
	handleInputChange: (
		event:
			| ChangeEvent<HTMLInputElement>
			| ChangeEvent<HTMLTextAreaElement>
	) => void;

	/**
	 * Form submission handler to automatically reset input and append a user message
	 * @example
	 * ```jsx
	 * <form onSubmit={handleSubmit}>
	 *  <input onChange={handleInputChange} value={input} />
	 * </form>
	 * ```
	 */
	handleSubmit: (event?: { preventDefault?: () => void }) => void;

	/** Whether the API request is in progress */
	isLoading: boolean;
	/** Additional data added on the server via StreamData */
	data?: JSONValue[];
};

export const useCompletion = ({
	api = '/api/completion',
	id,
	initialCompletion = '',
	initialInput = '',
	credentials,
	headers,
	body,
	streamMode,
	fetch,
	onResponse,
	onFinish,
	onError
}: UseCompletionOptions = {}): UseCompletionHelpers => {
	const hookId = useId();
	const completionId = id || hookId;

	const { data, mutate } = useSWR<string>([api, completionId], null, {
		fallbackData: initialCompletion
	});

	const { data: isLoading = false, mutate: mutateLoading } = useSWR<boolean>(
		[completionId, 'loading'],
		null
	);

	const { data: streamData, mutate: mutateStreamData } = useSWR<
		JSONValue[] | undefined
	>([completionId, 'streamData'], null);

	const [error, setError] = useState<undefined | Error>(undefined);
	const completion = data!;

	const [abortController, setAbortController] =
		useState<AbortController | null>(null);

	const extraMetadataRef = useRef({
		credentials,
		headers,
		body
	});
	useEffect(() => {
		extraMetadataRef.current = {
			credentials,
			headers,
			body
		};
	}, [credentials, headers, body]);

	const triggerRequest = useCallback(
		async (prompt: string = '...', options?: RequestOptions) =>
			callCompletionApi({
				api,
				prompt,
				credentials: extraMetadataRef.current.credentials,
				headers: { ...extraMetadataRef.current.headers, ...options?.headers },
				body: {
					...extraMetadataRef.current.body,
					...options?.body
				},
				streamMode,
				fetch,
				setCompletion: completion => mutate(completion, false),
				setLoading: mutateLoading,
				setError,
				setAbortController,
				onResponse,
				onFinish,
				onError,
				onData: data => {
					mutateStreamData([...(streamData || []), ...(data || [])], false);
				}
			}),
		[
			mutate,
			mutateLoading,
			api,
			extraMetadataRef,
			setAbortController,
			onResponse,
			onFinish,
			onError,
			setError,
			streamData,
			streamMode,
			fetch,
			mutateStreamData
		]
	);

	const stop = useCallback(() => {
		if (abortController) {
			abortController.abort();
			setAbortController(null);
		}
	}, [abortController]);

	const setCompletion = useCallback(
		(completion: string) => {
			mutate(completion, false);
		},
		[mutate]
	);

	const trigger = useCallback<UseCompletionHelpers['trigger']>(
		async (prompt = '...', options) => {
			return triggerRequest(prompt, options);
		},
		[triggerRequest]
	);

	const [input, setInput] = useState(initialInput);

	const handleSubmit = useCallback(
		(event?: { preventDefault?: () => void }) => {
			event?.preventDefault?.();
			return trigger(input || '...');
		},
		[input, trigger]
	);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
	};

	return {
		completion,
		trigger,
		error,
		setCompletion,
		stop,
		input,
		setInput,
		handleInputChange,
		handleSubmit,
		isLoading,
		data: streamData
	};
};
