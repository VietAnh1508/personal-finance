import { clearAppData } from '../database';

export async function resetLocalAppData(): Promise<void> {
  await clearAppData();
}
