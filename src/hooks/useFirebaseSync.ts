import { useEffect, useState } from 'react';
import {
  getSpinnerData,
  updateWords,
  updateGuaranteedWinners,
  updateSpinCount,
  updateGuaranteedWinnerIndex,
  updateSpinDuration,
  subscribeToSpinnerData,
  SpinnerData,
  GuaranteedWinner
} from '../services/firebaseService';
import { DEFAULT_WORDS } from '../constants';

export const useFirebaseSync = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [words, setWords] = useState<string[]>(DEFAULT_WORDS);
  const [guaranteedWinners, setGuaranteedWinners] = useState<GuaranteedWinner[]>([]);
  const [currentSpinCount, setCurrentSpinCount] = useState(0);
  const [guaranteedWinnerIndex, setGuaranteedWinnerIndex] = useState(0);
  const [spinDuration, setSpinDuration] = useState(10);

  // Load initial data và subscribe to changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeData = async () => {
      try {
        // Load data từ Firebase
        const data = await getSpinnerData();
        
        if (data) {
          setWords(data.words || DEFAULT_WORDS);
          setGuaranteedWinners(data.guaranteedWinners || []);
          setCurrentSpinCount(data.currentSpinCount || 0);
          setGuaranteedWinnerIndex(data.guaranteedWinnerIndex || 0);
          setSpinDuration(data.spinDuration || 10);
        } else {
          // Nếu chưa có data, khởi tạo mặc định
          await updateWords(DEFAULT_WORDS);
          await updateGuaranteedWinners([]);
          await updateSpinCount(0);
          await updateGuaranteedWinnerIndex(0);
          await updateSpinDuration(10);
        }

        setIsLoading(false);

        // Subscribe to real-time changes
        unsubscribe = subscribeToSpinnerData((data: SpinnerData | null) => {
          if (data) {
            setWords(data.words || DEFAULT_WORDS);
            setGuaranteedWinners(data.guaranteedWinners || []);
            setCurrentSpinCount(data.currentSpinCount || 0);
            setGuaranteedWinnerIndex(data.guaranteedWinnerIndex || 0);
            setSpinDuration(data.spinDuration || 10);
          }
        });
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
        setIsLoading(false);
      }
    };

    initializeData();

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const syncWords = async (newWords: string[]) => {
    setWords(newWords);
    await updateWords(newWords);
  };

  const syncGuaranteedWinners = async (winners: GuaranteedWinner[]) => {
    setGuaranteedWinners(winners);
    await updateGuaranteedWinners(winners);
  };

  const syncSpinCount = async (count: number) => {
    setCurrentSpinCount(count);
    await updateSpinCount(count);
  };

  const syncGuaranteedWinnerIndex = async (index: number) => {
    setGuaranteedWinnerIndex(index);
    await updateGuaranteedWinnerIndex(index);
  };

  const syncSpinDuration = async (duration: number) => {
    setSpinDuration(duration);
    await updateSpinDuration(duration);
  };

  return {
    isLoading,
    words,
    guaranteedWinners,
    currentSpinCount,
    guaranteedWinnerIndex,
    spinDuration,
    syncWords,
    syncGuaranteedWinners,
    syncSpinCount,
    syncGuaranteedWinnerIndex,
    syncSpinDuration
  };
};
