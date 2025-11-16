import { useState, useCallback } from 'react';
import { CardData } from '../components/SwipeCard';
import { performanceMonitor } from '../utils/PerformanceMonitor';

interface SwipeStackState {
  cards: CardData[];
  currentIndex: number;
  swipedCards: Array<{ card: CardData; direction: 'left' | 'right' | 'up' }>;
  isComplete: boolean;
}

export const useSwipeStack = (initialCards: CardData[]) => {
  const [state, setState] = useState<SwipeStackState>({
    cards: initialCards,
    currentIndex: 0,
    swipedCards: [],
    isComplete: false,
  });

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up', cardId: string) => {
    performanceMonitor.trackGesture();

    setState(prevState => {
      const swipedCard = prevState.cards.find(card => card.id === cardId);
      if (!swipedCard) return prevState;

      const newSwipedCards = [...prevState.swipedCards, { card: swipedCard, direction }];
      const newCurrentIndex = prevState.currentIndex + 1;
      const isComplete = newCurrentIndex >= prevState.cards.length;

      return {
        ...prevState,
        currentIndex: newCurrentIndex,
        swipedCards: newSwipedCards,
        isComplete,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      cards: initialCards,
      currentIndex: 0,
      swipedCards: [],
      isComplete: false,
    });
    performanceMonitor.reset();
  }, [initialCards]);

  const getVisibleCards = useCallback((count: number = 3) => {
    return state.cards
      .slice(state.currentIndex, state.currentIndex + count)
      .map((card, index) => ({
        card,
        index: state.currentIndex + index,
        isActive: index === 0,
      }));
  }, [state.cards, state.currentIndex]);

  const getStats = useCallback(() => {
    const likes = state.swipedCards.filter(item => item.direction === 'right').length;
    const nopes = state.swipedCards.filter(item => item.direction === 'left').length;
    const superLikes = state.swipedCards.filter(item => item.direction === 'up').length;

    return {
      totalSwipes: state.swipedCards.length,
      likes,
      nopes,
      superLikes,
      remaining: state.cards.length - state.currentIndex,
      progress: state.currentIndex / state.cards.length,
    };
  }, [state]);

  return {
    ...state,
    handleSwipe,
    reset,
    getVisibleCards,
    getStats,
  };
};