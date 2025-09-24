import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const QRScannerScreen {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type; data: string }) => {
    setScanned(true);
    Alert.alert(
      'QR Code Scanned!',
      `Data: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instructions}>
          Position the QR code within the frame to scan
        </Text>
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width,
    height,
    borderWidth,
    borderColor: '#FFFFFF',
    borderRadius,
    backgroundColor: 'transparent',
  },
  instructions: {
    color: '#FFFFFF',
    fontSize,
    textAlign: 'center',
    marginTop,
    paddingHorizontal,
  },
  scanAgainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal,
    paddingVertical,
    borderRadius,
    marginTop,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
