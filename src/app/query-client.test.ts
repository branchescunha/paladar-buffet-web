import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { queryClient } from './query-client';

describe('admin data refresh on visibility', () => {
  it('refreshes the active list without replacing an editable proposal detail', async () => {
    const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });
    const fetchList = vi.fn().mockResolvedValue([]);
    const fetchDetail = vi.fn().mockResolvedValue({ description: 'Rascunho em edição' });
    client.mount();
    const list = new QueryObserver(client, { queryKey: ['admin-proposals'], queryFn: fetchList });
    const detail = new QueryObserver(client, { queryKey: ['admin-proposal', 'proposal-1'], queryFn: fetchDetail });
    const unsubscribeList = list.subscribe(() => {});
    const unsubscribeDetail = detail.subscribe(() => {});

    try {
      await vi.waitFor(() => expect([fetchList.mock.calls.length, fetchDetail.mock.calls.length]).toEqual([1, 1]));
      window.dispatchEvent(new Event('visibilitychange'));
      await vi.waitFor(() => expect(fetchList).toHaveBeenCalledTimes(2));
      expect(fetchDetail).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribeList();
      unsubscribeDetail();
      client.unmount();
    }
  });
});
