import { clearAppData } from '@/data/database';

export async function resetLocalAppData(): Promise<void> {
  await clearAppData();
}
