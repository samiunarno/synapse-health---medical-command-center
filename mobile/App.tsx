import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform, ActivityIndicator } from 'react-native';

// Helper to determine standard local API URL based on emulator/simulator
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Standard loopback for Android emulator
  }
  return 'http://localhost:3000'; // Standard loopback for iOS simulator
};

export default function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [dbStatus, setDbStatus] = useState<string>('');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/health`);
        const data = await response.json();
        setHealthStatus(data.status === 'ok' ? 'Online' : 'Offline');
        setDbStatus(data.database);
      } catch (error) {
        setHealthStatus('Cannot Connect');
        setDbStatus('Check if web server is running on port 3000');
        console.error('API Error:', error);
      }
    };

    checkBackend();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Synapse Mobile Ecosystem</Text>
      <Text style={styles.subtitle}>Cross-Platform App (iOS & Android)</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend Status Connection:</Text>
        {healthStatus === 'Checking...' ? (
           <ActivityIndicator size="small" color="#0000ff" style={{ marginVertical: 10 }} />
        ) : (
          <>
            <Text style={styles.statusRow}>
              Server: <Text style={{ color: healthStatus === 'Online' ? 'green' : 'red' }}>{healthStatus}</Text>
            </Text>
            <Text style={styles.statusRow}>
              Database: <Text style={{ color: dbStatus === 'connected' ? 'green' : '#666' }}>{dbStatus}</Text>
            </Text>
          </>
        )}
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    fontSize: 14,
    marginTop: 4,
    color: '#334155'
  }
});
