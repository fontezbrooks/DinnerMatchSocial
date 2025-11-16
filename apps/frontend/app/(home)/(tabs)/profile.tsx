import { StyleSheet, ScrollView, Pressable } from 'react-native';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { SignOutButton } from '@/components/SignOutButton';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface ProfileSectionProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

function ProfileSection({ icon, title, subtitle, onPress }: ProfileSectionProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable style={styles.sectionItem} onPress={onPress}>
      <View style={styles.sectionContent}>
        <FontAwesome
          name={icon}
          size={24}
          color={Colors[colorScheme ?? 'light'].tint}
          style={styles.sectionIcon}
        />
        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        <FontAwesome
          name="chevron-right"
          size={16}
          color={Colors[colorScheme ?? 'light'].tabIconDefault}
        />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <FontAwesome
            name="user"
            size={40}
            color={Colors[colorScheme ?? 'light'].background}
          />
        </View>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>john.doe@example.com</Text>
      </View>

      {/* Dietary Restrictions */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Dietary Preferences</Text>
        <View style={styles.dietaryTags}>
          <View style={styles.dietaryTag}>
            <Text style={styles.dietaryTagText}>Vegetarian</Text>
          </View>
          <View style={styles.dietaryTag}>
            <Text style={styles.dietaryTagText}>No Nuts</Text>
          </View>
        </View>
      </View>

      {/* Energy Level */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Energy Level</Text>
        <Text style={styles.energyLevel}>Medium - Occasional dining out</Text>
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Settings</Text>

        <ProfileSection
          icon="edit"
          title="Edit Profile"
          subtitle="Update your information"
          onPress={() => console.log('Edit Profile')}
        />

        <ProfileSection
          icon="cutlery"
          title="Dietary Restrictions"
          subtitle="Manage your dietary preferences"
          onPress={() => console.log('Dietary Restrictions')}
        />

        <ProfileSection
          icon="bell"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => console.log('Notifications')}
        />

        <ProfileSection
          icon="shield"
          title="Privacy"
          subtitle="Privacy settings"
          onPress={() => console.log('Privacy')}
        />

        <ProfileSection
          icon="question-circle"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => console.log('Help & Support')}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dietaryTagText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  energyLevel: {
    fontSize: 16,
    color: '#666',
  },
  sectionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 16,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  signOutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});