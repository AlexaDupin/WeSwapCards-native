import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { getLatestChapters, type LatestChapter } from "@/src/features/chapters/api/chapters.api";

export default function LatestChaptersRow({ limit = 5 }: { limit?: number }) {
  const [items, setItems] = useState<LatestChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getLatestChapters(limit);
        if (mounted) setItems(data);
      } catch (e) {
        console.error("latest chapters failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  if (loading) return <ActivityIndicator />;

  if (items.length === 0) return null;

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20 }}>
        Browse the latest chapters
      </Text>

      <FlatList
        scrollEnabled={false}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={{ marginBottom: 16 }}>
              {!!item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: 140, borderRadius: 12 }}
                />
              )}
              <Text numberOfLines={2} style={{ marginTop: 8, fontWeight: "600", fontSize: 16 }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
