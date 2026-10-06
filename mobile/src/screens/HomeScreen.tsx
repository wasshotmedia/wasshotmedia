import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getDashboardOverview } from "../api";

export function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    metrics: {
      activeProjects: 0,
      totalClients: 0,
      upcomingShoots: 0,
      unpaidInvoices: 0,
      totalRevenue: 0,
    },
    upcomingShoots: [],
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getDashboardOverview();
    if (res) setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111110" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.tagline}>STUDIO OS · OPERATIONS</Text>
          <Text style={styles.title}>WasShot Media</Text>
        </View>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => navigation.navigate("Inquiries")}
        >
          <Ionicons name="notifications-outline" size={20} color="#FF4D14" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            tintColor="#FF4D14"
            colors={["#FF4D14"]}
          />
        }
      >
        {/* Crew Status Pill */}
        <View style={styles.crewCard}>
          <View style={styles.crewHeader}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.crewTitle}>Active Studio Crew</Text>
          </View>
          <View style={styles.crewMembers}>
            <View style={styles.crewBadge}>
              <Text style={styles.crewText}>Praneeth · Lead</Text>
            </View>
            <View style={styles.crewBadge}>
              <Text style={styles.crewText}>Wasim · Production</Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <Text style={styles.sectionTitle}>Key Performance</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Shoots")}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons name="videocam" size={18} color="#FF4D14" />
            </View>
            <Text style={styles.metricNumber}>
              {data.metrics?.upcomingShoots ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Upcoming Shoots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Clients")}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons name="people" size={18} color="#FF4D14" />
            </View>
            <Text style={styles.metricNumber}>
              {data.metrics?.totalClients ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Clients & CRM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Invoices")}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons name="receipt" size={18} color="#FF4D14" />
            </View>
            <Text style={styles.metricNumber}>
              {data.metrics?.unpaidInvoices ?? 0}
            </Text>
            <Text style={styles.metricLabel}>Pending Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate("Inquiries")}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons name="mail-unread" size={18} color="#FF4D14" />
            </View>
            <Text style={styles.metricNumber}>Live</Text>
            <Text style={styles.metricLabel}>Web Inquiries</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Shoots")}
          >
            <Ionicons name="calendar" size={16} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>View Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => Linking.openURL("https://instagram.com/wasshot.media")}
          >
            <Ionicons name="logo-instagram" size={16} color="#FF4D14" />
            <Text style={[styles.actionBtnText, { color: "#FF4D14" }]}>
              @wasshot.media
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Shoots Feed */}
        <Text style={styles.sectionTitle}>Shoots on Schedule</Text>
        {data.upcomingShoots && data.upcomingShoots.length > 0 ? (
          data.upcomingShoots.map((shoot: any, idx: number) => (
            <View key={idx} style={styles.shootCard}>
              <View style={styles.shootHeader}>
                <Text style={styles.shootTitle}>{shoot.title}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{shoot.type || "Shoot"}</Text>
                </View>
              </View>
              <Text style={styles.shootTime}>
                {new Date(shoot.start).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              {shoot.location ? (
                <Text style={styles.shootLocation}>📍 {shoot.location}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="camera-outline" size={32} color="#444" />
            <Text style={styles.emptyText}>No shoots scheduled for today</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111110",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222220",
  },
  tagline: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF4D14",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1C1C1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333330",
  },
  scrollContent: {
    padding: 20,
  },
  crewCard: {
    backgroundColor: "#1C1C1A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#282824",
  },
  crewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  crewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  crewMembers: {
    flexDirection: "row",
    gap: 8,
  },
  crewBadge: {
    backgroundColor: "#252522",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  crewText: {
    color: "#EEEEEE",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#181816",
    width: "48%",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#252522",
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 77, 20, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888888",
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#FF4D14",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF4D14",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  shootCard: {
    backgroundColor: "#181816",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#252522",
  },
  shootHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shootTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "rgba(255, 77, 20, 0.15)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    color: "#FF4D14",
    fontSize: 10,
    fontWeight: "700",
  },
  shootTime: {
    color: "#999999",
    fontSize: 12,
    marginTop: 6,
  },
  shootLocation: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#181816",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252522",
  },
  emptyText: {
    color: "#666666",
    fontSize: 12,
    marginTop: 8,
  },
});
