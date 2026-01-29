import { parseUpiUrl, UpiData } from "@/services/upi/parser";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  AppState,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function UpiScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [upiData, setUpiData] = useState<UpiData | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const [waitingForReturn, setWaitingForReturn] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Auto-request permission on mount
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  // Listen for app returning from background (after UPI payment)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && waitingForReturn && upiData) {
        console.log("📲 User returned to app after UPI payment");
        setWaitingForReturn(false);
        router.replace({
          pathname: "/upi-confirm",
          params: {
            merchant: upiData.name,
            amount: upiData.amount || "",
            note: upiData.note || "",
          },
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [waitingForReturn, upiData]);

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      console.log("⚠️ Camera permission denied permanently");
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={40} color="#3b82f6" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDescription}>
            To scan UPI QR codes, please allow access to your camera.
          </Text>

          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Not Now</Text>
          </Pressable>

          {!permission.canAskAgain && (
            <Text style={styles.settingsHint}>
              Permission denied permanently. Please enable camera access in your
              device settings.
            </Text>
          )}
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    console.log("📱 QR Code Scanned:", data);

    const parsed = parseUpiUrl(data);

    if (!parsed) {
      console.log("❌ Invalid UPI QR Code");
      setShowErrorModal(true);
      return;
    }

    console.log("✅ Parsed UPI Data:", JSON.stringify(parsed, null, 2));
    setUpiData(parsed);
    setScannedUrl(data);
    setShowModal(true);
  };

  const handleOpenUpi = async () => {
    if (!scannedUrl || !upiData) return;

    const canOpen = await Linking.canOpenURL(scannedUrl);
    if (canOpen) {
      console.log("🚀 Opening UPI app with URL:", scannedUrl);
      setShowModal(false);
      setWaitingForReturn(true);
      await Linking.openURL(scannedUrl);
      console.log("⏳ Waiting for user to return from UPI app...");
    } else {
      console.log("❌ No UPI app found");
      setShowModal(false);
      setScanned(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setScanned(false);
    setUpiData(null);
    setScannedUrl("");
    setWaitingForReturn(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.topSection}>
          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
          </View>
        </View>
        <View style={styles.bottomSection}>
          <Text style={styles.instruction}>Scan UPI QR Code</Text>
          <Text style={styles.subInstruction}>
            Align QR code within the frame
          </Text>
        </View>
      </View>
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>

      {/* Custom Payment Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>UPI Payment</Text>
            </View>

            <View style={styles.paymentDetails}>
              <View style={styles.merchantSection}>
                <Text style={styles.merchantLabel}>Pay to</Text>
                <Text style={styles.merchantName}>{upiData?.name}</Text>
                <Text style={styles.vpa}>{upiData?.vpa}</Text>
              </View>

              {upiData?.amount && (
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amount}>₹{upiData.amount}</Text>
                </View>
              )}

              {upiData?.note && (
                <View style={styles.noteSection}>
                  <Text style={styles.noteLabel}>Note</Text>
                  <Text style={styles.noteText}>{upiData.note}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPayButton} onPress={handleOpenUpi}>
                <Text style={styles.modalPayText}>Open UPI App</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={64} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Invalid QR Code</Text>
            <Text style={styles.errorMessage}>
              This is not a valid UPI QR code. Please scan a UPI payment QR
              code.
            </Text>
            <Pressable
              style={styles.errorButton}
              onPress={() => {
                setShowErrorModal(false);
                setScanned(false);
              }}
            >
              <Text style={styles.errorButtonText}>Scan Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanAreaContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: "#3b82f6",
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  cornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#60a5fa",
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#60a5fa",
    borderTopRightRadius: 24,
  },
  cornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#60a5fa",
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#60a5fa",
    borderBottomRightRadius: 24,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 40,
  },
  instruction: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subInstruction: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  subMessage: {
    color: "#a1a1aa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  settingsHint: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  message: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#27272a",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  paymentDetails: {
    padding: 24,
  },
  merchantSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  merchantLabel: {
    color: "#a1a1aa",
    fontSize: 14,
    marginBottom: 8,
  },
  merchantName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  vpa: {
    color: "#71717a",
    fontSize: 14,
  },
  amountSection: {
    backgroundColor: "#27272a",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  amountLabel: {
    color: "#a1a1aa",
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    color: "#3b82f6",
    fontSize: 36,
    fontWeight: "700",
  },
  noteSection: {
    backgroundColor: "#27272a",
    padding: 16,
    borderRadius: 12,
  },
  noteLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    marginBottom: 4,
  },
  noteText: {
    color: "#fff",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#27272a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalPayButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalPayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorMessage: {
    color: "#a1a1aa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 24,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  permissionDescription: {
    color: "#a1a1aa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#a1a1aa",
    fontSize: 16,
    fontWeight: "500",
  },
});
