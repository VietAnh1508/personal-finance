import { resetLocalAppData } from '@/data/repositories';

export async function resetAppData(): Promise<void> {
  await resetLocalAppData();
}
