import { StyleSheet, FlatList, Pressable } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Placeholder data for upcoming sessions
const upcomingSessions = [
  {
    id: '1',
    groupName: 'Work Friends',
    status: 'voting' as const,
    scheduledFor: '2024-11-20T12:00:00Z',
    votingDeadline: '2024-11-19T23:59:00Z',
    memberCount: 5,
    votesSubmitted: 3,
  },
  {
    id: '2',
    groupName: 'College Buddies',
    status: 'confirmed' as const,
    scheduledFor: '2024-11-25T19:00:00Z',
    restaurant: 'The Italian Place',
    memberCount: 8,
    confirmedCount: 6,
  },
  {
    id: '3',
    groupName: 'Foodie Friends',
    status: 'planning' as const,
    scheduledFor: '2024-11-30T18:30:00Z',
    memberCount: 3,
    suggestions: 2,
  },
];

interface SessionCardProps {
  session: typeof upcomingSessions[0];
  onPress: () => void;
}

function SessionCard({ session, onPress }: SessionCardProps) {
  const colorScheme = useColorScheme();

  const getStatusColor = () => {
    switch (session.status) {
      case 'planning':
        return '#FF9500';
      case 'voting':
        return '#007AFF';
      case 'confirmed':
        return '#34C759';
      default:
        return '#666';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'planning':
        return 'Planning';
      case 'voting':
        return 'Voting Open';
      case 'confirmed':
        return 'Confirmed';
      default:
        return session.status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Pressable style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.groupName}>{session.groupName}</Text>
          <Text style={styles.sessionDate}>{formatDate(session.scheduledFor)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {session.status === 'voting' && (
        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="check-circle" size={16} color="#34C759" />
            <Text style={styles.detailText}>
              {session.votesSubmitted}/{session.memberCount} votes submitted
            </Text>
          </View>
          <Text style={styles.deadline}>
            Voting ends {formatDate(session.votingDeadline!)}
          </Text>
        </View>
      )}

      {session.status === 'confirmed' && (
        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="map-marker" size={16} color="#FF3B30" />
            <Text style={styles.detailText}>{session.restaurant}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome name="users" size={16} color="#007AFF" />
            <Text style={styles.detailText}>
              {session.confirmedCount}/{session.memberCount} confirmed
            </Text>
          </View>
        </View>
      )}

      {session.status === 'planning' && (
        <View style={styles.sessionDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="lightbulb-o" size={16} color="#FF9500" />
            <Text style={styles.detailText}>
              {session.suggestions} restaurant suggestions
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const handleSessionPress = (sessionId: string) => {
    console.log('Navigate to session:', sessionId);
  };

  const handleCreateSession = () => {
    console.log('Create new session');
  };

  const renderSessionItem = ({ item }: { item: typeof upcomingSessions[0] }) => (
    <SessionCard session={item} onPress={() => handleSessionPress(item.id)} />
  );

  return (
    <View style={styles.container}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.createButton} onPress={handleCreateSession}>
          <FontAwesome name="plus" size={20} color="white" />
          <Text style={styles.createButtonText}>Plan New Session</Text>
        </Pressable>
      </View>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 ? (
        <FlatList
          data={upcomingSessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="calendar" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No upcoming sessions</Text>
          <Text style={styles.emptySubtext}>
            Plan a session with your groups to get started
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  quickActions: {
    padding: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  sessionDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  deadline: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});