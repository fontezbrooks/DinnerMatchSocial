import { StyleSheet, FlatList } from 'react-native';
import React from 'react';

import { Text, View } from '@/components/Themed';

// Placeholder data for past sessions
const pastSessions = [
  {
    id: '1',
    groupName: 'Work Friends',
    restaurant: 'The Italian Place',
    date: '2024-11-10',
    rating: 4.5,
  },
  {
    id: '2',
    groupName: 'College Buddies',
    restaurant: 'Sushi Zen',
    date: '2024-11-08',
    rating: 5,
  },
];

export default function HistoryScreen() {
  const renderSessionItem = ({ item }: { item: typeof pastSessions[0] }) => (
    <View style={styles.sessionCard}>
      <Text style={styles.groupName}>{item.groupName}</Text>
      <Text style={styles.restaurantName}>{item.restaurant}</Text>
      <Text style={styles.sessionDate}>{item.date}</Text>
      <Text style={styles.rating}>Rating: {item.rating}/5</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Dining Sessions</Text>
      {pastSessions.length > 0 ? (
        <FlatList
          data={pastSessions}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No past sessions yet</Text>
          <Text style={styles.emptySubtext}>
            Your completed dining sessions will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  sessionCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});