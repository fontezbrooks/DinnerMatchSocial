import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

import { useSessionStore } from '../store/sessionStore';
import SwipeStack, { RestaurantItem } from './SwipeStack';
import Timer from './Timer';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeSessionProps {
  sessionId: string;
  onLeaveSession: () => void;
}

// Mock restaurant data - in real app this would come from Yelp API or similar
const mockRestaurants: RestaurantItem[] = [
  {
    id: '1',
    name: 'The Italian Corner',
    cuisine: 'Italian',
    rating: 4.5,
    priceLevel: '2',
    address: '123 Main St, Downtown',
    imageUrl: 'https://via.placeholder.com/300x200/fd7e14/ffffff?text=Italian+Corner',
    categories: ['Italian', 'Pizza', 'Romantic'],
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.8,
    priceLevel: '3',
    address: '456 Oak Ave, Midtown',
    imageUrl: 'https://via.placeholder.com/300x200/e17055/ffffff?text=Sakura+Sushi',
    categories: ['Japanese', 'Sushi', 'Fresh'],
  },
  {
    id: '3',
    name: 'Burger Palace',
    cuisine: 'American',
    rating: 4.2,
    priceLevel: '1',
    address: '789 Pine St, Uptown',
    imageUrl: 'https://via.placeholder.com/300x200/f39c12/ffffff?text=Burger+Palace',
    categories: ['American', 'Burgers', 'Casual'],
  },
  {
    id: '4',
    name: 'Spice Garden',
    cuisine: 'Indian',
    rating: 4.6,
    priceLevel: '2',
    address: '321 Elm St, Southside',
    imageUrl: 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=Spice+Garden',
    categories: ['Indian', 'Spicy', 'Vegetarian'],
  },
  {
    id: '5',
    name: 'Le Petit Bistro',
    cuisine: 'French',
    rating: 4.7,
    priceLevel: '4',
    address: '654 Maple Dr, Downtown',
    imageUrl: 'https://via.placeholder.com/300x200/8e44ad/ffffff?text=Le+Petit+Bistro',
    categories: ['French', 'Fine Dining', 'Wine'],
  },
];

export const SwipeSession: React.FC<SwipeSessionProps> = ({
  sessionId,
  onLeaveSession,
}) => {
  const {
    session,
    connection,
    swipeVote,
    isSwipeEnabled,
    showTimer,
    recentVotes,
    matches,
    currentUser,
    startSession,
    endSession,
    leaveSession,
  } = useSessionStore();

  const [restaurants] = useState<RestaurantItem[]>(mockRestaurants);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!connection.isConnected) {
      Alert.alert('Connection Lost', 'Trying to reconnect...');
    }
  }, [connection.isConnected]);

  const handleSwipe = (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => {
    swipeVote(direction, item);
    setCurrentIndex(prev => prev + 1);
  };

  const handleStartSession = () => {
    if (!session) return;

    const user = session.users.find(u => u.userId === currentUser?.userId);
    if (!user?.isHost) {
      Alert.alert('Permission Denied', 'Only the host can start the session');
      return;
    }

    startSession().catch(error => {
      Alert.alert('Error', `Failed to start session: ${error.message}`);
    });
  };

  const handleLeaveSession = () => {
    Alert.alert(
      'Leave Session',
      'Are you sure you want to leave this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveSession();
            onLeaveSession();
          },
        },
      ]
    );
  };

  const handleEndSession = () => {
    if (!session) return;

    const user = session.users.find(u => u.userId === currentUser?.userId);
    if (!user?.isHost) {
      Alert.alert('Permission Denied', 'Only the host can end the session');
      return;
    }

    Alert.alert(
      'End Session',
      'Are you sure you want to end this session for everyone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: endSession,
        },
      ]
    );
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser_ = session.users.find(u => u.userId === currentUser?.userId);
  const isHost = currentUser_?.isHost || false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveSession} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {session.currentRound}</Text>
          <Text style={styles.headerSubtitle}>{session.users.length} players</Text>
        </View>

        {isHost && (
          <TouchableOpacity onPress={handleEndSession} style={styles.headerButton}>
            <Ionicons name="stop" size={24} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>

      {/* Connection Status */}
      {!connection.isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="cloud-offline" size={16} color="#F44336" />
          <Text style={styles.connectionText}>Reconnecting...</Text>
        </View>
      )}

      {/* Timer */}
      {showTimer && session.timer && (
        <View style={styles.timerContainer}>
          <Timer
            timeRemaining={session.timer.timeRemaining}
            totalTime={session.settings.timePerRound}
            isActive={session.timer.isActive}
            size={100}
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {session.status === 'pending' && (
          <View style={styles.waitingContainer}>
            <Ionicons name="people" size={60} color="#666" />
            <Text style={styles.waitingTitle}>Waiting to Start</Text>
            <Text style={styles.waitingText}>
              Waiting for host to start the session
            </Text>

            {/* User List */}
            <View style={styles.userList}>
              {session.users.map((user) => (
                <View key={user.userId} style={styles.userItem}>
                  <Text style={styles.userName}>{user.username}</Text>
                  {user.isHost && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>HOST</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {isHost && (
              <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
                <Text style={styles.startButtonText}>Start Session</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {session.status === 'voting' && restaurants.length > currentIndex && (
          <View style={styles.swipeContainer}>
            <SwipeStack
              items={restaurants.slice(currentIndex, currentIndex + 3)}
              onSwipe={handleSwipe}
              isEnabled={isSwipeEnabled}
              onStackEmpty={() => {
                Alert.alert('No More Options', 'Waiting for more restaurants...');
              }}
            />
          </View>
        )}

        {session.status === 'completed' && (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.completedTitle}>Session Complete!</Text>
            {matches.length > 0 ? (
              <View>
                <Text style={styles.completedText}>You found matches:</Text>
                {matches.map((match) => (
                  <Text key={match.item.id} style={styles.matchText}>
                    🎉 {match.item.name}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.completedText}>
                No matches found. Maybe try again with different preferences?
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Recent Votes */}
      {recentVotes.length > 0 && (
        <View style={styles.recentVotes}>
          <Text style={styles.recentVotesTitle}>Recent Votes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentVotes.slice(0, 5).map((vote, index) => (
              <View key={index} style={styles.voteItem}>
                <Text style={styles.voteUsername}>{vote.username}</Text>
                <View style={[
                  styles.voteIndicator,
                  { backgroundColor: getVoteColor(vote.vote) }
                ]}>
                  <Ionicons
                    name={getVoteIcon(vote.vote)}
                    size={12}
                    color="white"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Swipe Instructions */}
      {session.status === 'voting' && (
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>Swipe right to like</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-back" size={20} color="#F44336" />
            <Text style={styles.instructionText}>Swipe left to pass</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="arrow-up" size={20} color="#FF9800" />
            <Text style={styles.instructionText}>Swipe up to skip</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const getVoteColor = (vote: string) => {
  switch (vote) {
    case 'like': return '#4CAF50';
    case 'dislike': return '#F44336';
    case 'skip': return '#FF9800';
    default: return '#666';
  }
};

const getVoteIcon = (vote: string) => {
  switch (vote) {
    case 'like': return 'heart';
    case 'dislike': return 'close';
    case 'skip': return 'arrow-up';
    default: return 'help';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#ff9a9e', // Fallback solid color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 8,
  },
  connectionText: {
    marginLeft: 8,
    color: '#F44336',
    fontSize: 14,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  userList: {
    width: '100%',
    marginBottom: 32,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  hostBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeContainer: {
    flex: 1,
    paddingTop: 20,
  },
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 16,
  },
  completedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  matchText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  recentVotes: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recentVotesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  voteItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  voteUsername: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  voteIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  instructionItem: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default SwipeSession;