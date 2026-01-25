import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { getLatestChapters } from "@/src/features/chapters/api/chapters.api";
import { type LatestChapter } from "@/src/features/chapters/types/chapters.types";
import { LatestChaptersRowStyles } from "@/src/features/chapters/components/LatestChaptersRow.styles";

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

  if (loading) {
    return (
      <View style={LatestChaptersRowStyles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={LatestChaptersRowStyles.wrap}>
      <Text style={LatestChaptersRowStyles.kicker}>Recently added</Text>
      <Text style={LatestChaptersRowStyles.title}>Latest chapters</Text>

      <FlatList<LatestChapter>
        scrollEnabled={false}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={LatestChaptersRowStyles.card}>
              {!!item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={LatestChaptersRowStyles.image}
                />
              )}

              <Text numberOfLines={2} style={LatestChaptersRowStyles.name}>
                {item.name}
              </Text>

            </TouchableOpacity>
          </Link>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />
    </View>
  );
}
