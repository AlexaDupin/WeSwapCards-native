import { axiosInstance } from '@/src/lib/axiosInstance';

export type ExplorerInfo = { id: number; name: string } | null;

export type RegisterResponse = {
  message: string;
  user: { id: number; name: string };
};

export async function fetchExplorerInfo(params: {
  token: string;
  userUID: string;
}) {
  const resp = await axiosInstance.post<ExplorerInfo>(
    '/login/user',
    { userUID: params.userUID },
    { headers: { Authorization: `Bearer ${params.token}` } },
  );
  return resp.data ?? null;
}

export async function registerExplorer(params: {
  token: string;
  userUID: string;
  sanitizedUsername: string;
  userEmail?: string;
}) {
  const resp = await axiosInstance.post<RegisterResponse>(
    '/register/user',
    {
      userUID: params.userUID,
      userEmail: params.userEmail ?? '',
      sanitizedUsername: params.sanitizedUsername,
    },
    { headers: { Authorization: `Bearer ${params.token}` } },
  );
  return resp.data;
}
