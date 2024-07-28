import Dexie, { Table } from 'dexie';

enum MediaType {
  PHOTO,
  VIDEO
}

interface FFmpegCore {
  key: string;
  value: ArrayBuffer;
}

interface Media {
  id: string;
  url: string;
  type: MediaType;
  width: number;
  height: number;
  description?: string;
  transition: string;
  duration: number;
  createdAt: Date;
  projectId: string;
}

class MemoireDB extends Dexie {
  ffmpegCore!: Table<FFmpegCore>;
  media!: Table<Media>;

  constructor() {
    super('Memoire');
    this.version(1).stores({
      ffmpegCore: 'key', // primary key "key"
      media: '++id, url, type, width, height, description, transition, duration, createdAt, projectId'
    });
  }
}

const db = new MemoireDB();

export type { FFmpegCore, Media };
export { db, MediaType };
