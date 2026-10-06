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
import { getInvoices } from "../api";

export function InvoicesScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = async () => {
    setLoading(true);
    const data = await getInvoices();
    setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const formatCurrency = (amt?: number) => {
    if (typeof amt !== "number") return "₹0";
    return `₹${amt.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981" };
      case "pending":
      case "sent":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" };
      case "overdue":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" };
      default:
        return { bg: "#222220", text: "#888888" };
    }
  };

  const totalOutstanding = invoices.reduce((acc, inv) => {
    if (inv.status !== "paid") {
      return acc + (inv.balanceDue || inv.total || inv.amount || 0);
    }
    return acc;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Studio Invoices</Text>
          <Text style={styles.headerSub}>
            Billing · Retainers · Production Payables
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshIcon} onPress={loadInvoices}>
          <Ionicons name="refresh" size={18} color="#FF4D14" />
        </TouchableOpacity>
      </View>

      {/* Summary KPI Banner */}
      <View style={styles.kpiBanner}>
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>TOTAL INVOICES</Text>
          <Text style={styles.kpiValue}>{invoices.length}</Text>
        </View>
        <View style={styles.kpiDivider} />
        <View style={styles.kpiItem}>
          <Text style={styles.kpiLabel}>OUTSTANDING BALANCE</Text>
          <Text style={[styles.kpiValue, { color: "#F59E0B" }]}>
            {formatCurrency(totalOutstanding)}
          </Text>
        </View>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item, index) => item._id || item.invoiceNumber || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadInvoices}
            tintColor="#FF4D14"
            colors={["#FF4D14"]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={40} color="#555" />
              <Text style={styles.emptyTitle}>No invoices generated yet</Text>
              <Text style={styles.emptySub}>
                Invoices generated from production shoots and deliverables will appear here.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusColor(item.status);
          const amount = item.total || item.amount || 0;
          const balance = item.balanceDue !== undefined ? item.balanceDue : (item.status === "paid" ? 0 : amount);

          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.invoiceNum}>
                    {item.invoiceNumber || item.number || "INV-STUDIO"}
                  </Text>
                  <Text style={styles.clientName}>
                    {item.clientName || item.client?.name || "Client"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusStyle.text },
                    ]}
                  >
                    {item.status || "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amountValue}>
                    {formatCurrency(amount)}
                  </Text>
                </View>

                {balance > 0 && (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.amountLabel}>Balance Due</Text>
                    <Text style={styles.balanceValue}>
                      {formatCurrency(balance)}
                    </Text>
                  </View>
                )}
              </View>

              {item.dueDate && (
                <View style={styles.footerRow}>
                  <Ionicons name="time-outline" size={13} color="#777" />
                  <Text style={styles.dueDateText}>
                    Due: {new Date(item.dueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
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
  kpiBanner: {
    flexDirection: "row",
    backgroundColor: "#161614",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252522",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  kpiItem: {
    flex: 1,
    alignItems: "center",
  },
  kpiDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#252522",
  },
  kpiLabel: {
    fontSize: 10,
    color: "#777777",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
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
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invoiceNum: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  clientName: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#222220",
  },
  amountLabel: {
    fontSize: 10,
    color: "#777777",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F59E0B",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  dueDateText: {
    fontSize: 11,
    color: "#777777",
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
