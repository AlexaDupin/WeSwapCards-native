import { axiosInstance } from "@/src/lib/axiosInstance";
import type { LatestChapter } from "../types/chapters.types";

export async function getLatestChapters(limit = 5): Promise<LatestChapter[]> {
  const res = await axiosInstance.get<{ items: LatestChapter[] }>(
    "/chapters/latest", {
    params: { limit },
  });
  return res.data.items ?? [];
}