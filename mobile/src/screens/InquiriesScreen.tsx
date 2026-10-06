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
import { getMessages } from "../api";

export function InquiriesScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getMessages();
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const makeCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone?: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${clean}?text=Hi%20there,%20this%20is%20WasShot%20Media%20regarding%20your%20inquiry!`);
    }
  };

  const sendEmail = (email?: string, name?: string) => {
    if (email) {
      Linking.openURL(
        `mailto:${email}?subject=Regarding%20your%20inquiry%20with%20WasShot%20Media&body=Hi%20${encodeURIComponent(
          name || "there"
        )},%0A%0AThank%20you%20for%20reaching%20out%20to%20WasShot%20Media!`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Website Leads & Inbound</Text>
          <Text style={styles.headerSub}>
            wasshot.in Form Submissions · Instant Client Connect
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshIcon} onPress={loadMessages}>
          <Ionicons name="refresh" size={18} color="#FF4D14" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMessages}
            tintColor="#FF4D14"
            colors={["#FF4D14"]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-open-outline" size={40} color="#555" />
              <Text style={styles.emptyTitle}>No inbound inquiries yet</Text>
              <Text style={styles.emptySub}>
                When clients fill the contact form on wasshot.in, notifications and lead details appear here instantly.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={18} color="#FF4D14" />
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.leadName}>{item.name || "Anonymous Lead"}</Text>
                <Text style={styles.leadCompany}>
                  {item.company ? item.company : (item.email || "No contact info")}
                </Text>
              </View>
              {item.service && (
                <View style={styles.serviceBadge}>
                  <Text style={styles.serviceText}>{item.service}</Text>
                </View>
              )}
            </View>

            {item.message ? (
              <View style={styles.messageBox}>
                <Text style={styles.messageText} numberOfLines={4}>
                  "{item.message}"
                </Text>
              </View>
            ) : null}

            {/* Metadata badges (budget, timeline) */}
            <View style={styles.metaRow}>
              {item.budget && (
                <View style={styles.metaPill}>
                  <Ionicons name="cash-outline" size={12} color="#10B981" />
                  <Text style={[styles.metaText, { color: "#10B981" }]}>
                    {item.budget}
                  </Text>
                </View>
              )}
              {item.timeline && (
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={12} color="#3B82F6" />
                  <Text style={[styles.metaText, { color: "#3B82F6" }]}>
                    {item.timeline}
                  </Text>
                </View>
              )}
              {item.createdAt && (
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={12} color="#777" />
                  <Text style={styles.metaText}>
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick 1-Tap Reachout Actions */}
            <View style={styles.actionsRow}>
              {item.phone && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => makeCall(item.phone)}
                >
                  <Ionicons name="call" size={14} color="#FF4D14" />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              )}

              {item.phone && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.waBtn]}
                  onPress={() => openWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#10B981" />
                  <Text style={[styles.actionText, { color: "#10B981" }]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              )}

              {item.email && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => sendEmail(item.email, item.name)}
                >
                  <Ionicons name="mail" size={14} color="#3B82F6" />
                  <Text style={[styles.actionText, { color: "#3B82F6" }]}>
                    Email
                  </Text>
                </TouchableOpacity>
              )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  refreshIcon: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#181816",
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 77, 20, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  nameBlock: {
    flex: 1,
  },
  leadName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  leadCompany: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  serviceBadge: {
    backgroundColor: "rgba(255, 77, 20, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    color: "#FF4D14",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  messageBox: {
    backgroundColor: "#131311",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF4D14",
  },
  messageText: {
    fontSize: 13,
    color: "#CCCCCC",
    lineHeight: 18,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#20201D",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: "#AAAAAA",
    fontWeight: "600",
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
