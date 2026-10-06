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
import { getClients } from "../api";

export function ClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const makeCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone?: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${clean}`);
    }
  };

  const sendEmail = (email?: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Studio Clients & CRM</Text>
        <Text style={styles.headerSub}>
          Accounts · Retainers · Production Partnerships
        </Text>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadClients}
            tintColor="#FF4D14"
            colors={["#FF4D14"]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={40} color="#555" />
              <Text style={styles.emptyTitle}>No client records yet</Text>
              <Text style={styles.emptySub}>
                New clients created on web or converted from leads will appear here.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name ? item.name[0].toUpperCase() : "C"}
                </Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{item.name}</Text>
                {item.company ? (
                  <Text style={styles.company}>{item.company}</Text>
                ) : null}
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status || "Active"}</Text>
              </View>
            </View>

            {/* Contact Actions Row (Direct 1-tap Call, WhatsApp, Email) */}
            <View style={styles.actionsRow}>
              {item.phone ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => makeCall(item.phone)}
                >
                  <Ionicons name="call" size={14} color="#FF4D14" />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              ) : null}

              {item.phone ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.waBtn]}
                  onPress={() => openWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
                  <Text style={[styles.actionText, { color: "#10B981" }]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              ) : null}

              {item.email ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => sendEmail(item.email)}
                >
                  <Ionicons name="mail" size={14} color="#3B82F6" />
                  <Text style={[styles.actionText, { color: "#3B82F6" }]}>
                    Email
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#252522",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 77, 20, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FF4D14",
    fontSize: 18,
    fontWeight: "800",
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  company: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#222220",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    color: "#AAAAAA",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#222220",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#222220",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  waBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  actionText: {
    color: "#FF4D14",
    fontSize: 12,
    fontWeight: "700",
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
