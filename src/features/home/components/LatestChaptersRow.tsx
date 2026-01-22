import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { getLatestChapters, type LatestChapter } from "@/src/features/chapters/api/chapters.api";

export default function LatestChaptersRow({ limit = 10 }: { limit?: number }) {
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
    <View style={{ marginTop: 18 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
        Browse the latest chapters
      </Text>

      <FlatList
        horizontal
        data={items}
        keyExtractor={(it) => String(it.id)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={{ width: 150, marginRight: 12 }}>
              {!!item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: "100%", height: 95, borderRadius: 12 }}
                />
              )}
              <Text numberOfLines={2} style={{ marginTop: 8, fontWeight: "600" }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
