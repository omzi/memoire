interface AudioVideoFilter {
  filter: string;
  options: string | string[] | {};
};

interface FilterSpecification {
  filter: string;
  inputs?: string | string[] | undefined;
  outputs?: string | string[] | undefined;
  options?: any | string | any[] | undefined;
};

type JobStatus = 'pending' | 'completed' | 'failed' | 'uploading';

type Outputs = Record<string, string>

class JobEntity {
  public id: number
  public status: JobStatus
  public outputs: Outputs
  public logs?: string
  public created_at: string

  constructor(data: {
    id: number
    status: JobStatus
    outputs: Outputs
    logs?: string
    created_at: string
  }) {
    this.id = data.id;
    this.status = data.status;
    this.outputs = data.outputs;
    this.logs = data.logs;
    this.created_at = data.created_at;
  }
};

type StreamPotOptions = {
	secret: string;
	baseUrl?: string;
}

export default class StreamPot {
	protected secret: string;
	protected baseUrl: string;
	protected actions: any[] = []; // Array to store actions

	constructor({ secret, baseUrl = 'https://api.streampot.io/v1' }: StreamPotOptions) {
		this.secret = secret;
		this.baseUrl = baseUrl;
	}

	protected handleError(response: Response) {
		if (response.status === 401) {
			throw new Error('Invalid StreamPot secret key')
		}

		if (response.status >= 400) {
			throw new Error(`StreamPot API: ${response.status} ${response.statusText}`)
		}
	}

	public async getJob(jobId: number): Promise<JobEntity> {
		const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
			headers: {
				'Accept': 'application/json',
				Authorization: `Bearer ${this.secret}`
			}
		})

		this.handleError(response);

		return new JobEntity(await response.json());
	}

	/**
	 * @deprecated Use `getJob(jobId)` instead
	 */
	public async checkStatus(jobId: string | number): Promise<JobEntity> {
		return await this.getJob(Number(jobId));
	}

	/**
	 * Run the job and immediately return the job entity.
	 */
	public async run(): Promise<JobEntity> {
		const response = await fetch(`${this.baseUrl}/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.secret}`
			},
			body: JSON.stringify(this.actions)
		})

		this.handleError(response);

		this.actions = []; // Clear actions after running
		return new JobEntity(await response.json());
	}

	/**
	 * Run the job and wait for it to complete or fail.
	 */
	public async runAndWait(intervalMs: number = 1000): Promise<JobEntity> {
		let job = await this.run();

		while (job.status !== 'completed' && job.status !== 'failed') {
			await new Promise(resolve => setTimeout(resolve, intervalMs))
			job = await this.getJob(job.id);
		}

		return job;
	}

	// Modified addAction to directly push actions 
	protected addAction(name: string, ...values: any) {
		this.actions.push({ name, value: values });
	}

	public mergeAdd(source: string) {
		this.addAction('mergeAdd', source);
	}
	
	public addInput(source: string) {
		this.addAction('addInput', source);
	}

  public input(source: string) {
		this.addAction('input', source);
  }

  public withInputFormat(format: string) {
		this.addAction('withInputFormat', format);
  }

  public inputFormat(format: string) {
		this.addAction('inputFormat', format);
  }

  public fromFormat(format: string) {
		this.addAction('fromFormat', format);
  }

  public withInputFps(fps: number) {
		this.addAction('withInputFps', fps);
  }

  public withInputFPS(fps: number) {
		this.addAction('withInputFPS', fps);
  }

  public withFpsInput(fps: number) {
		this.addAction('withFpsInput', fps);
  }

  public withFPSInput(fps: number) {
		this.addAction('withFPSInput', fps);
  }

  public inputFPS(fps: number) {
		this.addAction('inputFPS', fps);
  }

  public inputFps(fps: number) {
		this.addAction('inputFps', fps);
  }

  public fpsInput(fps: number) {
		this.addAction('fpsInput', fps);
  }

  public FPSInput(fps: number) {
		this.addAction('FPSInput', fps);
  }

  public nativeFramerate() {
		this.addAction('nativeFramerate');
  }

  public withNativeFramerate() {
		this.addAction('withNativeFramerate');
  }

  public native() {
		this.addAction('native');
  }

  public setStartTime(seek: string | number) {
		this.addAction('setStartTime', seek);
  }

  public seekInput(seek: string | number) {
		this.addAction('seekInput', seek);
  }

  public loop(duration: string | number | undefined) {
		this.addAction('loop', duration);
  }

  public withNoAudio() {
		this.addAction('withNoAudio');
  }

  public noAudio() {
		this.addAction('noAudio');
  }

  public withAudioCodec(codec: string) {
		this.addAction('withAudioCodec', codec);
  }

  public audioCodec(codec: string) {
		this.addAction('audioCodec', codec);
  }

  public withAudioBitrate(bitrate: string | number) {
		this.addAction('withAudioBitrate', bitrate);
  }

  public audioBitrate(bitrate: string | number) {
		this.addAction('audioBitrate', bitrate);
  }

  public withAudioChannels(channels: number) {
		this.addAction('withAudioChannels', channels);
  }

  public audioChannels(channels: number) {
		this.addAction('audioChannels', channels);
  }

  public withAudioFrequency(freq: number) {
		this.addAction('withAudioFrequency', freq);
  }

  public audioFrequency(freq: number) {
		this.addAction('audioFrequency', freq);
  }

  public withAudioQuality(quality: number) {
		this.addAction('withAudioQuality', quality);
  }

  public audioQuality(quality: number) {
		this.addAction('audioQuality', quality);
  }

  public withAudioFilter(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('withAudioFilter', filters);
  }

  public withAudioFilters(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('withAudioFilters', filters);
  }

  public audioFilter(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('audioFilter', filters);
  }

  public audioFilters(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('audioFilters', filters);
  }

  public withNoVideo() {
		this.addAction('withNoVideo');
  }

  public noVideo() {
		this.addAction('noVideo');
  }

  public withVideoCodec(codec: string) {
		this.addAction('withVideoCodec', codec);
  }

  public videoCodec(codec: string) {
		this.addAction('videoCodec', codec);
  }

  public withVideoBitrate(bitrate: string | number, constant: boolean | undefined) {
		this.addAction('withVideoBitrate', bitrate, constant);
  }

  public videoBitrate(bitrate: string | number, constant: boolean | undefined) {
		this.addAction('videoBitrate', bitrate, constant);
  }

  public withVideoFilter(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('withVideoFilter', filters);
  }

  public withVideoFilters(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('withVideoFilters', filters);
  }

  public videoFilter(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('videoFilter', filters);
  }

  public videoFilters(filters: string | string[] | AudioVideoFilter[]) {
		this.addAction('videoFilters', filters);
  }

  public withOutputFps(fps: number) {
		this.addAction('withOutputFps', fps);
  }

  public withOutputFPS(fps: number) {
		this.addAction('withOutputFPS', fps);
  }

  public withFpsOutput(fps: number) {
		this.addAction('withFpsOutput', fps);
  }

  public withFPSOutput(fps: number) {
		this.addAction('withFPSOutput', fps);
  }

  public withFps(fps: number) {
		this.addAction('withFps', fps);
  }

  public withFPS(fps: number) {
		this.addAction('withFPS', fps);
  }

  public outputFPS(fps: number) {
		this.addAction('outputFPS', fps);
  }

  public outputFps(fps: number) {
		this.addAction('outputFps', fps);
  }

  public fpsOutput(fps: number) {
		this.addAction('fpsOutput', fps);
  }

  public FPSOutput(fps: number) {
		this.addAction('FPSOutput', fps);
  }

  public fps(fps: number) {
		this.addAction('fps', fps);
  }

  public FPS(fps: number) {
		this.addAction('FPS', fps);
  }

  public takeFrames(frames: number) {
		this.addAction('takeFrames', frames);
  }

  public withFrames(frames: number) {
		this.addAction('withFrames', frames);
  }

  public frames(frames: number) {
		this.addAction('frames', frames);
  }

  public keepPixelAspect() {
		this.addAction('keepPixelAspect');
  }

  public keepDisplayAspect() {
		this.addAction('keepDisplayAspect');
  }

  public keepDisplayAspectRatio() {
		this.addAction('keepDisplayAspectRatio');
  }

  public keepDAR() {
		this.addAction('keepDAR');
  }

  public withSize(size: string) {
		this.addAction('withSize', size);
  }

  public setSize(size: string) {
		this.addAction('setSize', size);
  }

  public size(size: string) {
		this.addAction('size', size);
  }

  public withAspect(aspect: string | number) {
		this.addAction('withAspect', aspect);
  }

  public withAspectRatio(aspect: string | number) {
		this.addAction('withAspectRatio', aspect);
  }

  public setAspect(aspect: string | number) {
		this.addAction('setAspect', aspect);
  }

  public setAspectRatio(aspect: string | number) {
		this.addAction('setAspectRatio', aspect);
  }

  public aspect(aspect: string | number) {
		this.addAction('aspect', aspect);
  }

  public aspectRatio(aspect: string | number) {
		this.addAction('aspectRatio', aspect);
  }

  public applyAutopadding(pad: boolean | undefined, color: string | undefined) {
		this.addAction('applyAutopadding', pad, color);
  }

  public applyAutoPadding(pad: boolean | undefined, color: string | undefined) {
		this.addAction('applyAutoPadding', pad, color);
  }

  public applyAutopad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('applyAutopad', pad, color);
  }

  public applyAutoPad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('applyAutoPad', pad, color);
  }

  public withAutopadding(pad: boolean | undefined, color: string | undefined) {
		this.addAction('withAutopadding', pad, color);
  }

  public withAutoPadding(pad: boolean | undefined, color: string | undefined) {
		this.addAction('withAutoPadding', pad, color);
  }

  public withAutopad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('withAutopad', pad, color);
  }

  public withAutoPad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('withAutoPad', pad, color);
  }

  public autoPad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('autoPad', pad, color);
  }

  public autopad(pad: boolean | undefined, color: string | undefined) {
		this.addAction('autopad', pad, color);
  }

  public addOutput(target: string) {
		this.addAction('addOutput', target);
  }

  public output(target: string) {
		this.addAction('output', target);
  }

  public seekOutput(seek: string | number) {
		this.addAction('seekOutput', seek);
  }

  public seek(seek: string | number) {
		this.addAction('seek', seek);
  }

  public withDuration(duration: string | number) {
		this.addAction('withDuration', duration);
  }

  public setDuration(duration: string | number) {
		this.addAction('setDuration', duration);
  }

  public duration(duration: string | number) {
		this.addAction('duration', duration);
  }

  public toFormat(format: string) {
		this.addAction('toFormat', format);
  }

  public withOutputFormat(format: string) {
		this.addAction('withOutputFormat', format);
  }

  public outputFormat(format: string) {
		this.addAction('outputFormat', format);
  }

  public format(format: string) {
		this.addAction('format', format);
  }

  public map(spec: string) {
		this.addAction('map', spec);
  }

  public updateFlvMetadata() {
		this.addAction('updateFlvMetadata');
  }

  public flvmeta() {
		this.addAction('flvmeta');
  }

  public addInputOption(...options: string[] | [string[]]) {
		this.addAction('addInputOption', ...options);
  }

  public withInputOptions(...options: string[] | [string[]]) {
		this.addAction('withInputOptions', ...options);
  }

  public withInputOption(...options: string[] | [string[]]) {
		this.addAction('withInputOption', ...options);
  }

  public inputOption(...options: string[] | [string[]]) {
		this.addAction('inputOption', ...options);
  }

  public addInputOptions(...options: string[] | [string[]]) {
		this.addAction('addInputOptions', ...options);
  }

  public addOutputOption(...options: string[] | [string[]]) {
		this.addAction('addOutputOption', ...options);
  }

  public addOutputOptions(...options: string[] | [string[]]) {
		this.addAction('addOutputOptions', ...options);
  }

  public addOption(...options: string[] | [string[]]) {
		this.addAction('addOption', ...options);
  }

  public withOutputOption(...options: string[] | [string[]]) {
		this.addAction('withOutputOption', ...options);
  }

  public withOutputOptions(...options: string[] | [string[]]) {
		this.addAction('withOutputOptions', ...options);
  }

  public withOption(...options: string[] | [string[]]) {
		this.addAction('withOption', ...options);
  }

  public withOptions(...options: string[] | [string[]]) {
		this.addAction('withOptions', ...options);
  }

  public outputOption(...options: string[] | [string[]]) {
		this.addAction('outputOption', ...options);
  }

  public outputOptions(...options: string[] | [string[]]) {
		this.addAction('outputOptions', ...options);
  }

  public filterGraph(
		spec: string | FilterSpecification | Array<string | FilterSpecification>,
    map?: string[] | string,
  ) {
		this.addAction('filterGraph', spec, map);
  }

  public complexFilter(
		spec: string | FilterSpecification | Array<string | FilterSpecification>,
		map?: string[] | string,
	) {
		this.addAction('complexFilter', spec, map);
	}
}
