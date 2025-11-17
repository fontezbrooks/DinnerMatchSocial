import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/clerk-expo';

import { useSessionStore } from '../../../store/sessionStore';
import SwipeSession from '../../../components/SwipeSession';

export default function SwipeTab() {
  const { user } = useClerk();
  const {
    socket,
    connection,
    session,
    connect,
    joinSession,
    clearSession,
  } = useSessionStore();

  const [sessionId, setSessionId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Initialize socket connection when component mounts
  useEffect(() => {
    if (user && !socket) {
      initializeConnection();
    }
  }, [user, socket]);

  const initializeConnection = async () => {
    if (!user) return;

    try {
      // Get authentication token (this would normally come from your auth system)
      // For demo purposes, we'll create a simple token
      const token = `demo_token_${user.id}_${Date.now()}`;

      await connect(token);

      // Set current user in store
      useSessionStore.setState({
        currentUser: {
          userId: user.id,
          username: user.username || user.emailAddresses[0]?.emailAddress || 'User',
        },
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      Alert.alert('Connection Error', 'Failed to connect to server');
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId.trim()) {
      Alert.alert('Invalid Session ID', 'Please enter a valid session ID');
      return;
    }

    setIsJoining(true);

    try {
      await joinSession(sessionId.trim());
      setShowJoinForm(false);
      setSessionId('');
    } catch (error) {
      console.error('Failed to join session:', error);
      Alert.alert('Join Failed', 'Could not join session. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateSession = () => {
    // For demo purposes, create a demo session ID
    const demoSessionId = `demo_${Date.now()}`;
    setSessionId(demoSessionId);
    handleJoinSession();
  };

  const handleLeaveSession = () => {
    clearSession();
  };

  // If user is in a session, show the swipe interface
  if (session) {
    return (
      <SwipeSession
        sessionId={session.sessionId}
        onLeaveSession={handleLeaveSession}
      />
    );
  }

  // Show connection and join interface
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="restaurant" size={60} color="#4CAF50" />
          <Text style={styles.title}>Dinner Match</Text>
          <Text style={styles.subtitle}>Swipe together to find the perfect meal</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons
              name={connection.isConnected ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={connection.isConnected ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.statusTitle}>
              {connection.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          {connection.error && (
            <Text style={styles.errorText}>{connection.error}</Text>
          )}

          {connection.isConnecting && (
            <Text style={styles.connectingText}>Connecting...</Text>
          )}
        </View>

        {/* Session Actions */}
        {connection.isConnected && (
          <View style={styles.actionsContainer}>
            {!showJoinForm ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setShowJoinForm(true)}
                >
                  <Ionicons name="enter" size={20} color="white" />
                  <Text style={styles.buttonText}>Join Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCreateSession}
                >
                  <Ionicons name="add" size={20} color="#4CAF50" />
                  <Text style={styles.secondaryButtonText}>Create Demo Session</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.joinForm}>
                <Text style={styles.formTitle}>Join a Session</Text>

                <TextInput
                  style={styles.input}
                  value={sessionId}
                  onChangeText={setSessionId}
                  placeholder="Enter Session ID"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowJoinForm(false);
                      setSessionId('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.joinButton, isJoining && styles.disabledButton]}
                    onPress={handleJoinSession}
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <Text style={styles.buttonText}>Joining...</Text>
                    ) : (
                      <>
                        <Ionicons name="enter" size={16} color="white" />
                        <Text style={styles.buttonText}>Join</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How it works</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="people" size={20} color="#666" />
            <Text style={styles.instructionText}>
              Join a session with friends
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="restaurant" size={20} color="#666" />
            <Text style={styles.instructionText}>
              Swipe through restaurant options
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="heart" size={20} color="#666" />
            <Text style={styles.instructionText}>
              Find matches when everyone agrees
            </Text>
          </View>
        </View>

        {/* Debug Info for Development */}
        {__DEV__ && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText}>
              Connected: {connection.isConnected ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              User: {user?.username || 'Not logged in'}
            </Text>
            <Text style={styles.debugText}>
              Reconnect Attempts: {connection.reconnectAttempts}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    fontSize: 14,
  },
  connectingText: {
    color: '#FF9800',
    marginTop: 8,
    fontSize: 14,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  joinForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  debugCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});