import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface MatchItem {
  id: string;
  type: 'restaurant' | 'recipe';
  name: string;
  image: string;
  rating?: number;
  price?: string;
  address?: string;
  readyInMinutes?: number;
  servings?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  url?: string;
  phone?: string;
}

interface MatchResultsProps {
  matches: MatchItem[];
  sessionId: string;
  onStartNewRound?: () => void;
  onEndSession?: () => void;
}

const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  sessionId,
  onStartNewRound,
  onEndSession,
}) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location services to get directions to restaurants.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const getDirections = async (item: MatchItem) => {
    if (!item.coordinates && !item.address) {
      Alert.alert('Error', 'No location available for this item');
      return;
    }

    setLoadingDirections(item.id);

    try {
      let destination = '';

      if (item.coordinates) {
        destination = `${item.coordinates.latitude},${item.coordinates.longitude}`;
      } else if (item.address) {
        destination = encodeURIComponent(item.address);
      }

      let origin = '';
      if (userLocation) {
        origin = `${userLocation.coords.latitude},${userLocation.coords.longitude}`;
      }

      // Choose map app based on platform
      let mapsUrl = '';
      if (Platform.OS === 'ios') {
        // Apple Maps on iOS
        if (origin) {
          mapsUrl = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`;
        } else {
          mapsUrl = `http://maps.apple.com/?daddr=${destination}`;
        }
      } else {
        // Google Maps on Android (and fallback)
        if (origin) {
          mapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
        } else {
          mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
        }
      }

      const supported = await Linking.canOpenURL(mapsUrl);
      if (supported) {
        await Linking.openURL(mapsUrl);
      } else {
        Alert.alert('Error', 'Could not open maps application');
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Could not get directions');
    } finally {
      setLoadingDirections(null);
    }
  };

  const callRestaurant = async (phone: string) => {
    try {
      const phoneUrl = `tel:${phone}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Could not open phone application');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Could not make call');
    }
  };

  const openWebsite = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open website');
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Could not open website');
    }
  };

  const shareMatch = async (item: MatchItem) => {
    try {
      const message = `Check out this ${item.type}: ${item.name}`;
      const url = item.url || '';

      // This would typically use Expo.Sharing or React Native Share
      Alert.alert('Share', `Would share: ${message}\n${url}`);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // This would typically refresh the match data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#FFD700"
        />
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderMatchItem = ({ item }: { item: MatchItem }) => (
    <View style={styles.matchCard}>
      <Image source={{ uri: item.image }} style={styles.matchImage} />

      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.name}</Text>

        {item.type === 'restaurant' && (
          <View style={styles.restaurantInfo}>
            {item.rating && (
              <View style={styles.ratingContainer}>
                {renderStars(item.rating)}
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            {item.price && (
              <Text style={styles.priceText}>{item.price}</Text>
            )}
            {item.address && (
              <Text style={styles.addressText}>{item.address}</Text>
            )}
          </View>
        )}

        {item.type === 'recipe' && (
          <View style={styles.recipeInfo}>
            {item.readyInMinutes && (
              <Text style={styles.timeText}>
                <Ionicons name="time-outline" size={14} color="#666" />
                {' '}{item.readyInMinutes} min
              </Text>
            )}
            {item.servings && (
              <Text style={styles.servingsText}>
                <Ionicons name="people-outline" size={14} color="#666" />
                {' '}{item.servings} servings
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.type === 'restaurant' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => getDirections(item)}
              disabled={loadingDirections === item.id}
            >
              {loadingDirections === item.id ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="navigate" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>

            {item.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => callRestaurant(item.phone!)}
              >
                <Ionicons name="call" size={20} color="#34C759" />
              </TouchableOpacity>
            )}
          </>
        )}

        {item.url && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openWebsite(item.url!)}
          >
            <Ionicons name="globe-outline" size={20} color="#FF9500" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => shareMatch(item)}
        >
          <Ionicons name="share-outline" size={20} color="#5856D6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Matches Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your preferences and starting a new round!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🎉 It's a Match!</Text>
      <Text style={styles.headerSubtitle}>
        Here are your group's unanimous choices:
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {onStartNewRound && (
        <TouchableOpacity
          style={[styles.footerButton, styles.newRoundButton]}
          onPress={onStartNewRound}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.footerButtonText}>Start New Round</Text>
        </TouchableOpacity>
      )}

      {onEndSession && (
        <TouchableOpacity
          style={[styles.footerButton, styles.endSessionButton]}
          onPress={onEndSession}
        >
          <Ionicons name="stop" size={20} color="white" />
          <Text style={styles.footerButtonText}>End Session</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        ListHeaderComponent={matches.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          matches.length === 0 && styles.centeredContainer
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  matchImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  matchInfo: {
    padding: 16,
  },
  matchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  restaurantInfo: {
    gap: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  recipeInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#7f8c8d',
    alignItems: 'center',
  },
  servingsText: {
    fontSize: 14,
    color: '#7f8c8d',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 24,
    paddingBottom: 10,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  newRoundButton: {
    backgroundColor: '#007AFF',
  },
  endSessionButton: {
    backgroundColor: '#FF3B30',
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchResults;