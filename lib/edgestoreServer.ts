import { initEdgeStore } from '@edgestore/server';
import { initEdgeStoreClient } from '@edgestore/server/core';

const edgeStore = initEdgeStore.create();
export const edgeStoreRouter = edgeStore.router({
	chatFiles: edgeStore.fileBucket()
		.beforeDelete(() => {
			return true;
		}),
	paperFiles: edgeStore.fileBucket()
		.beforeDelete(() => {
			return true;
		})
});

export const edgestoreBackendClient = initEdgeStoreClient({
  router: edgeStoreRouter
});
