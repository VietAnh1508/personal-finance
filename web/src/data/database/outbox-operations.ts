import { db, type OutboxRow } from './schema';

export async function enqueueOutboxRow(
  params: {
    id: string;
    operationType: string;
    entityType: string;
    entityId: string;
    payload: unknown;
  },
  nowIso: string
): Promise<void> {
  await db.outbox.add({
    id: params.id,
    operationType: params.operationType,
    entityType: params.entityType,
    entityId: params.entityId,
    payload: params.payload,
    status: 'pending',
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function listOutboxRowsByStatus(status: OutboxRow['status']): Promise<OutboxRow[]> {
  return db.outbox.where('status').equals(status).sortBy('createdAt');
}

export async function updateOutboxRowStatus(
  id: string,
  status: OutboxRow['status'],
  nowIso: string
): Promise<void> {
  const row = await db.outbox.get(id);
  if (!row) {
    return;
  }

  await db.outbox.put({
    ...row,
    status,
    updatedAt: nowIso,
  });
}

export async function deleteOutboxRow(id: string): Promise<void> {
  await db.outbox.delete(id);
}
