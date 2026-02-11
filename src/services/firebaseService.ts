import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';

export interface GuaranteedWinner {
  id: number;
  name: string;
}

export interface SpinnerData {
  words: string[];
  guaranteedWinners: GuaranteedWinner[];
  currentSpinCount: number;
  guaranteedWinnerIndex: number;
  spinDuration: number;
}

const SPINNER_REF = 'spinner_data';

// Lấy dữ liệu từ Firebase
export const getSpinnerData = async (): Promise<SpinnerData | null> => {
  try {
    const snapshot = await get(ref(database, SPINNER_REF));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting spinner data:', error);
    return null;
  }
};

// Cập nhật toàn bộ dữ liệu
export const setSpinnerData = async (data: Partial<SpinnerData>): Promise<void> => {
  try {
    const currentData = await getSpinnerData();
    const updatedData = { ...currentData, ...data };
    await set(ref(database, SPINNER_REF), updatedData);
  } catch (error) {
    console.error('Error setting spinner data:', error);
  }
};

// Cập nhật danh sách tên
export const updateWords = async (words: string[]): Promise<void> => {
  try {
    await set(ref(database, `${SPINNER_REF}/words`), words);
  } catch (error) {
    console.error('Error updating words:', error);
  }
};

// Cập nhật guaranteed winners
export const updateGuaranteedWinners = async (winners: GuaranteedWinner[]): Promise<void> => {
  try {
    await set(ref(database, `${SPINNER_REF}/guaranteedWinners`), winners);
  } catch (error) {
    console.error('Error updating guaranteed winners:', error);
  }
};

// Cập nhật lượt quay hiện tại
export const updateSpinCount = async (count: number): Promise<void> => {
  try {
    await set(ref(database, `${SPINNER_REF}/currentSpinCount`), count);
  } catch (error) {
    console.error('Error updating spin count:', error);
  }
};

// Cập nhật index của guaranteed winner
export const updateGuaranteedWinnerIndex = async (index: number): Promise<void> => {
  try {
    await set(ref(database, `${SPINNER_REF}/guaranteedWinnerIndex`), index);
  } catch (error) {
    console.error('Error updating guaranteed winner index:', error);
  }
};

// Cập nhật thời gian quay
export const updateSpinDuration = async (duration: number): Promise<void> => {
  try {
    await set(ref(database, `${SPINNER_REF}/spinDuration`), duration);
  } catch (error) {
    console.error('Error updating spin duration:', error);
  }
};

// Lắng nghe thay đổi real-time
export const subscribeToSpinnerData = (callback: (data: SpinnerData | null) => void): (() => void) => {
  const dataRef = ref(database, SPINNER_REF);
  
  const unsubscribe = onValue(dataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to spinner data:', error);
  });

  // Trả về hàm để unsubscribe
  return () => off(dataRef, 'value', unsubscribe);
};

// Reset toàn bộ dữ liệu
export const resetSpinnerData = async (): Promise<void> => {
  try {
    await set(ref(database, SPINNER_REF), {
      words: [],
      guaranteedWinners: [],
      currentSpinCount: 0,
      guaranteedWinnerIndex: 0,
      spinDuration: 10
    });
  } catch (error) {
    console.error('Error resetting spinner data:', error);
  }
};
