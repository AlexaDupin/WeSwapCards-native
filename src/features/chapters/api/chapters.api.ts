import { axiosInstance } from "@/src/lib/axiosInstance";

export type LatestChapter = {
  id: number;
  name: string;
  image_url: string | null;
};

export async function getLatestChapters(limit = 10): Promise<LatestChapter[]> {
  const res = await axiosInstance.get<{ items: LatestChapter[] }>("/chapters/latest", {
    params: { limit },
  });
  return res.data.items ?? [];
}
