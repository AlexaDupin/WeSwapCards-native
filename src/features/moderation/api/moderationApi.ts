import { axiosInstance } from '@/src/lib/axiosInstance';
import type { BlockedUser } from '@/src/features/moderation/types/BlockedUser';
import type { ReportReason } from '@/src/features/moderation/types/ReportReason';

type AuthHeaders = Record<string, string>;

type BlockArgs = {
  explorerId: number;
  targetExplorerId: number;
  headers: AuthHeaders;
};

type GetMyBlocksArgs = {
  explorerId: number;
  headers: AuthHeaders;
};

type ReportUserArgs = {
  explorerId: number;
  reportedExplorerId: number;
  conversationId: number | null;
  reason: ReportReason;
  comment: string | null;
  headers: AuthHeaders;
};

export async function blockUser({
  explorerId,
  targetExplorerId,
  headers,
}: BlockArgs) {
  await axiosInstance.post(
    `/block/${explorerId}/${targetExplorerId}`,
    {},
    { headers, timeout: 20000 },
  );
}

export async function unblockUser({
  explorerId,
  targetExplorerId,
  headers,
}: BlockArgs) {
  await axiosInstance.delete(`/block/${explorerId}/${targetExplorerId}`, {
    headers,
    timeout: 20000,
  });
}

export async function getMyBlocks({
  explorerId,
  headers,
}: GetMyBlocksArgs): Promise<BlockedUser[]> {
  const resp = await axiosInstance.get(`/block/${explorerId}`, {
    headers,
    timeout: 20000,
  });
  return (resp.data ?? []) as BlockedUser[];
}

export async function reportUser({
  explorerId,
  reportedExplorerId,
  conversationId,
  reason,
  comment,
  headers,
}: ReportUserArgs) {
  await axiosInstance.post(
    `/report/${explorerId}`,
    {
      reported_explorer_id: reportedExplorerId,
      conversation_id: conversationId,
      reason,
      comment,
    },
    { headers, timeout: 20000 },
  );
}
