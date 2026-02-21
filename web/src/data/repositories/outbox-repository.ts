import {
  enqueueOutboxOperation,
  listPendingOutboxOperations,
  removeOutboxOperation,
  setOutboxOperationStatus,
} from '@/data/database';

export type OutboxOperation = {
  id: string;
  operationType: string;
  entityType: string;
  entityId: string;
  payload: unknown;
  status: 'pending' | 'processing' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export async function enqueueOperation(params: {
  id: string;
  operationType: string;
  entityType: string;
  entityId: string;
  payload: unknown;
}): Promise<void> {
  await enqueueOutboxOperation(params);
}

export async function listPendingOperations(): Promise<OutboxOperation[]> {
  return listPendingOutboxOperations();
}

export async function markOperationStatus(
  id: string,
  status: OutboxOperation['status']
): Promise<void> {
  await setOutboxOperationStatus(id, status);
}

export async function removeOperation(id: string): Promise<void> {
  await removeOutboxOperation(id);
}
