import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getCalendarEvents } from "../api";

export function ShootsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getCalendarEvents();
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openMap = (loc: string, url?: string) => {
    if (url) {
      Linking.openURL(url);
    } else if (loc) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(loc)}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shoots & Schedule</Text>
        <Text style={styles.headerSub}>
          Cinematography · Recce · Production Milestones
        </Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadEvents}
            tintColor="#FF4D14"
            colors={["#FF4D14"]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#555" />
              <Text style={styles.emptyTitle}>No scheduled shoots</Text>
              <Text style={styles.emptySub}>
                Productions scheduled from the web or studio panel will sync here in real time.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.type || "Shoot"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.infoText}>
                {new Date(item.start).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {item.location ? (
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={() => openMap(item.location, item.locationUrl)}
              >
                <Ionicons name="location-outline" size={14} color="#FF4D14" />
                <Text style={styles.locationText}>{item.location}</Text>
                <Ionicons name="arrow-forward" size={12} color="#FF4D14" />
              </TouchableOpacity>
            ) : null}

            {item.equipmentNeeded && item.equipmentNeeded.length > 0 ? (
              <View style={styles.gearBox}>
                <Text style={styles.gearLabel}>Camera & Gear Checklist:</Text>
                <Text style={styles.gearText}>
                  {item.equipmentNeeded.join(" · ")}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111110",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222220",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerSub: {
    fontSize: 11,
    color: "#888888",
    marginTop: 2,
    fontWeight: "600",
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: "#181816",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#252522",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: "rgba(255, 77, 20, 0.15)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FF4D14",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  infoText: {
    color: "#BBBBBB",
    fontSize: 12,
    fontWeight: "500",
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#222220",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  locationText: {
    color: "#EEEEEE",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  gearBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#222220",
  },
  gearLabel: {
    color: "#777777",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gearText: {
    color: "#AAAAAA",
    fontSize: 11,
    lineHeight: 16,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
