import { StyleSheet, FlatList, Pressable } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Placeholder data for user groups
const userGroups = [
  {
    id: '1',
    name: 'Work Friends',
    description: 'Weekly lunch crew from the office',
    memberCount: 5,
    nextSession: '2024-11-20',
    isActive: true,
  },
  {
    id: '2',
    name: 'College Buddies',
    description: 'Monthly dinner reunions',
    memberCount: 8,
    nextSession: '2024-11-25',
    isActive: true,
  },
  {
    id: '3',
    name: 'Foodie Friends',
    description: 'Exploring new restaurants together',
    memberCount: 3,
    nextSession: null,
    isActive: false,
  },
];

interface GroupCardProps {
  group: typeof userGroups[0];
  onPress: () => void;
}

function GroupCard({ group, onPress }: GroupCardProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable style={styles.groupCard} onPress={onPress}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <FontAwesome
            name="users"
            size={24}
            color={Colors[colorScheme ?? 'light'].background}
          />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: group.isActive ? '#4CAF50' : '#9E9E9E' }]}>
          <Text style={styles.statusText}>{group.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.groupDetails}>
        <View style={styles.detailItem}>
          <FontAwesome name="user" size={16} color="#666" />
          <Text style={styles.detailText}>{group.memberCount} members</Text>
        </View>

        {group.nextSession && (
          <View style={styles.detailItem}>
            <FontAwesome name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>Next: {group.nextSession}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme();

  const handleGroupPress = (groupId: string) => {
    console.log('Navigate to group:', groupId);
  };

  const handleCreateGroup = () => {
    console.log('Create new group');
  };

  const handleJoinGroup = () => {
    console.log('Join existing group');
  };

  const renderGroupItem = ({ item }: { item: typeof userGroups[0] }) => (
    <GroupCard group={item} onPress={() => handleGroupPress(item.id)} />
  );

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={handleCreateGroup}>
          <FontAwesome name="plus" size={20} color="white" />
          <Text style={styles.actionButtonText}>Create Group</Text>
        </Pressable>

        <Pressable style={[styles.actionButton, styles.secondaryButton]} onPress={handleJoinGroup}>
          <FontAwesome name="link" size={20} color={Colors[colorScheme ?? 'light'].tint} />
          <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            Join Group
          </Text>
        </Pressable>
      </View>

      {/* Groups List */}
      {userGroups.length > 0 ? (
        <FlatList
          data={userGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="users" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>
            Create or join a group to start planning dinner sessions
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
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  groupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
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