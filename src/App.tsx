import gsap from "gsap";
import { useEffect, useState } from "react";
import Confetti from "react-confetti-boom";
import bg from "./assets/images/bg.png";
import {
  audioLoopRoller,
  audioWinnerFunc
} from "./common/audio-func";
import { gsapOne } from "./common/gasp-number";
import { FireworkCanvas } from "./components";
import { useFirebaseSync } from "./hooks/useFirebaseSync";

function App() {
  // Firebase sync
  const {
    isLoading: isFirebaseLoading,
    words,
    guaranteedWinners,
    currentSpinCount,
    guaranteedWinnerIndex,
    spinDuration,
    syncWords,
    syncSpinCount,
    syncGuaranteedWinnerIndex,
    syncSpinDuration
  } = useFirebaseSync();

  const [isWinner, setIsWinner] = useState(false);
  const [isSpin, setIsSpin] = useState(false);
  const [inputText, setInputText] = useState("");
  const [winnerName, setWinnerName] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [customSpinAudio, setCustomSpinAudio] = useState<string>("");
  const [customWinAudio, setCustomWinAudio] = useState<string>("");
  const [dotRed, setDotRed] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  // Load custom audio from localStorage only
  useEffect(() => {
    const savedSpinAudio = localStorage.getItem('spinner_spin_audio');
    const savedWinAudio = localStorage.getItem('spinner_win_audio');
    if (savedSpinAudio) setCustomSpinAudio(savedSpinAudio);
    if (savedWinAudio) setCustomWinAudio(savedWinAudio);
  }, []);

  // Nhấp nháy chấm tròn đồng bộ
  useEffect(() => {
    const interval = setInterval(() => {
      setDotRed(prev => !prev);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Khi mở modal, tự động đổ danh sách words vào textarea
  useEffect(() => {
    if (showModal) {
      setInputText(words.join('\n'));
    }
  }, [showModal, words]);

  const getGuaranteedWinner = (): { name: string; index: number } | null => {
    console.log(`Check guaranteed: index=${guaranteedWinnerIndex}, total=${guaranteedWinners.length}`);

    // Nếu hết danh sách guaranteed winners
    if (guaranteedWinnerIndex >= guaranteedWinners.length) {
      console.log('Hết danh sách guaranteed winners, quay random');
      return null;
    }

    const nextWinner = guaranteedWinners[guaranteedWinnerIndex];

    if (nextWinner) {
      console.log(`Tìm thấy guaranteed winner: ${nextWinner.name} (thứ tự #${guaranteedWinnerIndex + 1})`);

      // Nếu là RANDOM thì quay ngẫu nhiên
      if (nextWinner.name === 'RANDOM') {
        console.log('Lượt này là RANDOM - sẽ quay ngẫu nhiên');
        return { name: 'RANDOM', index: -1 }; // -1 để báo hiệu cần quay random
      }

      // Tìm index của tên trong danh sách words
      const wordIndex = words.findIndex(w => w === nextWinner.name);
      if (wordIndex !== -1) {
        console.log(`Match với index ${wordIndex} trong danh sách`);
        return { name: nextWinner.name, index: wordIndex };
      } else {
        // Tên không tồn tại trong danh sách, log cảnh báo và skip đến người tiếp theo
        console.warn(`Guaranteed winner "${nextWinner.name}" không tồn tại trong danh sách. Bỏ qua và tăng index.`);

        // Tăng index để bỏ qua tên này
        syncGuaranteedWinnerIndex(guaranteedWinnerIndex + 1);

        // Thử lấy người tiếp theo
        return getGuaranteedWinner();
      }
    }

    console.log('Không tìm thấy guaranteed winner');
    return null;
  };

  const randomUnixIndex = (): number => {
    let usedNumbers: number[] = JSON.parse(
      localStorage.getItem('used_numbers') || '[]'
    );
    let usedNumberSet = new Set(usedNumbers);

    // Nếu đã hết số để quay, reset lại
    if (usedNumberSet.size >= words.length) {
      console.log('Đã quay hết tất cả, reset lại danh sách');
      usedNumbers = [];
      usedNumberSet = new Set();
      localStorage.setItem('used_numbers', '[]');
    }

    // Tìm tất cả số chưa sử dụng
    const availableIndices: number[] = [];
    for (let i = 0; i < words.length; i++) {
      if (!usedNumberSet.has(i)) {
        availableIndices.push(i);
      }
    }

    // Nếu không còn số nào available (không nên xảy ra sau reset ở trên)
    if (availableIndices.length === 0) {
      console.error('Không tìm thấy số available, reset và lấy số 0');
      localStorage.setItem('used_numbers', '[0]');
      return 0;
    }

    // Chọn ngẫu nhiên từ các số available
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // Lưu số đã sử dụng
    usedNumbers.push(randomIndex);
    localStorage.setItem('used_numbers', JSON.stringify(usedNumbers));

    console.log(`Quay được số ${randomIndex} (${words[randomIndex]}), còn ${availableIndices.length - 1} số chưa quay`);

    return randomIndex;
  };

  const handleRandomValue = (): { wordIndex: number; word: string; isGuaranteed: boolean } => {
    console.log(`=== Lượt quay ${currentSpinCount + 1} ===`);

    // Ưu tiên kiểm tra guaranteed winner
    const guaranteedWinner = getGuaranteedWinner();

    if (guaranteedWinner) {
      // Nếu là RANDOM (index = -1), quay ngẫu nhiên nhưng vẫn tăng guaranteed index
      if (guaranteedWinner.index === -1) {
        console.log('Guaranteed winner là RANDOM - quay ngẫu nhiên');
        const randomIndex = randomUnixIndex();
        return {
          wordIndex: randomIndex,
          word: words[randomIndex],
          isGuaranteed: true, // Vẫn đánh dấu là guaranteed để tăng index
        };
      }

      console.log(`Sử dụng guaranteed winner: ${guaranteedWinner.name} (index: ${guaranteedWinner.index})`);

      // Cũng cần lưu vào used_numbers để tránh trùng
      const usedNumbers: number[] = JSON.parse(
        localStorage.getItem('used_numbers') || '[]'
      );

      if (!usedNumbers.includes(guaranteedWinner.index)) {
        usedNumbers.push(guaranteedWinner.index);
        localStorage.setItem('used_numbers', JSON.stringify(usedNumbers));
      }

      return {
        wordIndex: guaranteedWinner.index,
        word: guaranteedWinner.name,
        isGuaranteed: true,
      };
    }

    // Không có guaranteed winner, quay ngẫu nhiên
    console.log('Không có guaranteed winner, quay ngẫu nhiên');
    const randomIndex = randomUnixIndex();
    return {
      wordIndex: randomIndex,
      word: words[randomIndex],
      isGuaranteed: false,
    };
  };

  const handleSpiner = () => {
    if (isSpin) {
      console.log('Đang quay, bỏ qua click');
      return;
    }

    console.log('=== BẮT ĐẦU QUAY ===');
    setIsSpin(true);
    setHasSpun(true);
    setIsWinner(false);
    setWinnerName(""); // Reset winner name

    // Đợi DOM re-render để đảm bảo có spinner elements
    setTimeout(() => {
      const { wordIndex, word, isGuaranteed } = handleRandomValue();
      const elems = document.querySelectorAll(".number > div");

      console.log(`Tìm thấy ${elems.length} elements để animate`);

      // Nếu không tìm thấy elements, reset state và thử lại
      if (elems.length === 0) {
        console.error('Không tìm thấy elements! Reset state và thử lại sau 100ms');
        setTimeout(() => {
          const retryElems = document.querySelectorAll(".number > div");
          console.log(`Retry: Tìm thấy ${retryElems.length} elements`);

          if (retryElems.length === 0) {
            console.error('Vẫn không tìm thấy elements! Force reset state');
            setIsSpin(false);
            alert('Lỗi: Không tìm thấy spinner elements. Vui lòng refresh trang!');
            return;
          }

          // Retry animation với elements mới
          startAnimation(retryElems, wordIndex, word, isGuaranteed);
        }, 100);
        return;
      }

      startAnimation(elems, wordIndex, word, isGuaranteed);
    }, 50); // Đợi 50ms cho DOM update
  };

  const startAnimation = (elems: NodeListOf<Element>, wordIndex: number, word: string, isGuaranteed: boolean) => {
    let isDone = false;

    // Sử dụng custom audio nếu có, không thì dùng mặc định
    const loopRoller = customSpinAudio
      ? new Audio(customSpinAudio)
      : audioLoopRoller();
    loopRoller.loop = true;
    loopRoller.volume = 0.4;

    // Fallback timeout nếu animation không kết thúc
    const safetyTimeout = setTimeout(() => {
      if (!isDone) {
        console.error('Animation timeout! Force reset state');
        loopRoller.pause();
        loopRoller.currentTime = 0;
        setIsSpin(false);
        setIsWinner(true);
        setWinnerName(word);
        syncSpinCount(currentSpinCount + 1);
      }
    }, (spinDuration + 5) * 1000); // timeout = spinDuration + 5 giây buffer

    loopRoller.play();

    elems.forEach((elem, idx) => {
      console.log(`Animate elem ${idx}`);
      gsap.set(elem, { y: 0 });
      gsapOne({
        elem: elem as HTMLDivElement,
        number: wordIndex,
        totalDuration: spinDuration,
        itemCount: words.length,
        onComplete: () => {
          if (isDone) {
            console.log(`onComplete called but already done (elem ${idx})`);
            return;
          }

          console.log(`=== ANIMATION COMPLETE (elem ${idx}) ===`);

          const audioWinner = customWinAudio
            ? new Audio(customWinAudio)
            : audioWinnerFunc();
          audioWinner.volume = 0.4;
          isDone = true;

          // Clear safety timeout
          if (safetyTimeout) clearTimeout(safetyTimeout);

          loopRoller.pause();
          loopRoller.currentTime = 0;
          audioWinner.play();

          console.log('Setting state: isSpin=false, isWinner=true');
          setIsSpin(false);
          setIsWinner(true);
          setWinnerName(word);
          syncSpinCount(currentSpinCount + 1);

          // Nếu là guaranteed winner, tăng index
          if (isGuaranteed) {
            syncGuaranteedWinnerIndex(guaranteedWinnerIndex + 1);
            console.log(`Tăng guaranteed_winner_index -> ${guaranteedWinnerIndex + 1}`);
          }
        },
        onAlmostFinished: () => {
          // Không thay đổi audio - để phát liên tục cho đến khi kết thúc
        },
      });
    });
  };

  const handleAddWords = () => {
    if (!inputText.trim()) return;
    // Hỗ trợ cả dấu phẩy và xuống dòng
    const newWords = inputText
      .split(/[,\n]+/)
      .map(w => w.trim())
      .filter(w => w);
    if (newWords.length > 0) {
      syncWords(newWords);
      setInputText("");
      setShowModal(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let newWords: string[] = [];

      // Xử lý file CSV hoặc TXT
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        // Tách theo dấu phẩy hoặc xuống dòng
        newWords = text
          .split(/[,\n\r]+/)
          .map(w => w.trim())
          .filter(w => w);
      } else if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          newWords = Array.isArray(parsed) ? parsed : [];
        } catch {
          alert('File JSON không hợp lệ!');
          return;
        }
      }

      if (newWords.length > 0) {
        // Đổ data vào textarea, mỗi tên một dòng
        setInputText(newWords.join('\n'));
        alert(`Đã load ${newWords.length} tên vào textarea. Kiểm tra và nhấn "Cập nhật danh sách" để lưu.`);
      } else {
        alert('Không tìm thấy dữ liệu trong file!');
      }
    };

    reader.readAsText(file);
    // Reset input để có thể upload lại cùng file
    event.target.value = '';
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'spin' | 'win') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra file audio
    if (!file.type.startsWith('audio/')) {
      alert('Vui lòng chọn file âm thanh!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      if (type === 'spin') {
        setCustomSpinAudio(base64);
        localStorage.setItem('spinner_spin_audio', base64);
      } else {
        setCustomWinAudio(base64);
        localStorage.setItem('spinner_win_audio', base64);
      }

      alert('Đã tải lên nhạc thành công!');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveAudio = (type: 'spin' | 'win') => {
    if (type === 'spin') {
      setCustomSpinAudio("");
      localStorage.removeItem('spinner_spin_audio');
    } else {
      setCustomWinAudio("");
      localStorage.removeItem('spinner_win_audio');
    }
    alert('Đã xóa nhạc tùy chỉnh!');
  };

  // Loading state while Firebase initializes
  if (isFirebaseLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9E6] to-[#FFE8B0]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F5971E] mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed top-8 left-8 z-20 bg-white text-gray-700 p-4 rounded-full shadow-2xl hover:scale-110 transition-all"
        title="Cài đặt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

      {/* Admin Button */}
      {/* <button
        onClick={() => navigate('/admin')}
        className="fixed top-8 right-8 z-20 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-110 transition-all font-semibold"
        title="Admin Panel"
      >
        🔐 Admin
      </button> */}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Cài đặt danh sách</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-4xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập danh sách tên (mỗi tên trên một dòng hoặc phân cách bởi dấu phẩy)&#10;&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-[#F5971E] text-lg min-h-[200px] resize-none"
                  rows={8}
                />
                <button
                  onClick={handleAddWords}
                  className="bg-[#4CAF50] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all self-end"
                >
                  Cập nhật danh sách
                </button>
              </div>

              {/* Import button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <label className="bg-[#2196F3] text-white px-6 py-3 rounded-xl font-semibold cursor-pointer hover:scale-105 transition-all flex items-center gap-2">
                  <input
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  📥 Import từ File
                </label>
                <span className="text-gray-600 text-sm">
                  {words.length} tên trong danh sách
                </span>
              </div>

              {/* Spin Duration Setting */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">⏱️ Thời gian quay</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={3}
                    max={120}
                    value={spinDuration}
                    onChange={(e) => {
                      const val = Math.max(3, Math.min(120, Number(e.target.value) || 3));
                      syncSpinDuration(val);
                    }}
                    className="w-24 px-4 py-2 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-[#F5971E] text-lg text-center"
                  />
                  <span className="text-gray-600">giây / lượt quay</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Tối thiểu 3 giây, tối đa 120 giây</p>
              </div>

              {/* Audio Settings */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🎵 Cài đặt nhạc</h3>

                {/* Spin Audio */}
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nhạc khi quay</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:scale-105 transition-all flex items-center gap-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleAudioUpload(e, 'spin')}
                        className="hidden"
                      />
                      🎶 {customSpinAudio ? 'Thay đổi' : 'Tải lên'}
                    </label>
                    {customSpinAudio && (
                      <button
                        onClick={() => handleRemoveAudio('spin')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-all"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                    <span className="text-sm text-gray-600">
                      {customSpinAudio ? '✅ Đã tùy chỉnh' : '🔊 Mặc định'}
                    </span>
                  </div>
                </div>

                {/* Win Audio */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Nhạc khi trúng thưởng</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer hover:scale-105 transition-all flex items-center gap-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleAudioUpload(e, 'win')}
                        className="hidden"
                      />
                      🎶 {customWinAudio ? 'Thay đổi' : 'Tải lên'}
                    </label>
                    {customWinAudio && (
                      <button
                        onClick={() => handleRemoveAudio('win')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-all"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                    <span className="text-sm text-gray-600">
                      {customWinAudio ? '✅ Đã tùy chỉnh' : '🔊 Mặc định'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen relative z-[10] flex items-center pt-[120px] justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Decorative border with dots */}
          <div className="relative bg-[#FFC04A] rounded-3xl p-5 shadow-2xl">
            {/* Dots border */}
            <div className="absolute inset-0 rounded-3xl p-2">
              {/* Top dots */}
              <div className="absolute top-[3px] left-0 right-0 flex justify-evenly px-6">
                {Array(35).fill("").map((_, i) => (
                  <div key={`top-${i}`} className={`w-3.5 h-3.5 rounded-full transition-colors duration-0 ${dotRed ? 'bg-[rgb(235,33,57)]' : 'bg-white'}`} />
                ))}
              </div>
              {/* Bottom dots */}
              <div className="absolute bottom-[3px] left-0 right-0 flex justify-evenly px-6">
                {Array(35).fill("").map((_, i) => (
                  <div key={`bottom-${i}`} className={`w-3.5 h-3.5 rounded-full transition-colors duration-0 ${dotRed ? 'bg-[rgb(235,33,57)]' : 'bg-white'}`} />
                ))}
              </div>
              {/* Left dots */}
              <div className="absolute left-[3px] top-0 bottom-0 flex flex-col justify-evenly py-4">
                {Array(8).fill("").map((_, i) => (
                  <div key={`left-${i}`} className={`w-3.5 h-3.5 rounded-full transition-colors duration-0 ${dotRed ? 'bg-[rgb(235,33,57)]' : 'bg-white'}`} />
                ))}
              </div>
              {/* Right dots */}
              <div className="absolute right-[3px] top-0 bottom-0 flex flex-col justify-evenly py-4">
                {Array(8).fill("").map((_, i) => (
                  <div key={`right-${i}`} className={`w-3.5 h-3.5 rounded-full transition-colors duration-0 ${dotRed ? 'bg-[rgb(235,33,57)]' : 'bg-white'}`} />
                ))}
              </div>
            </div>

            {/* Display area */}
            <div className="relative bg-white rounded-2xl p-6 min-w-[800px] min-h-[200px] flex items-center justify-center">
              {isWinner && winnerName ? (
                // Hiển thị tên trúng thưởng
                <div className="text-center px-8">
                  <h2 className="text-7xl font-bold text-black whitespace-nowrap">
                    {winnerName}
                  </h2>
                </div>
              ) : !hasSpun ? (
                // Chưa quay - hiển thị ô trống
                <div className="flex items-center justify-center h-[140px] min-w-[600px] max-w-[900px] px-8">
                  <div className="text-center rounded-[0.6rem] w-full h-full">
                    <div className="h-full text-black flex flex-col overflow-hidden items-center justify-center rounded-[0.4rem] font-semibold bg-white">
                      <div className="h-[128px] flex items-center justify-center">
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Hiển thị spinner
                <div className="flex items-center justify-center h-[140px] min-w-[600px] max-w-[900px] px-8">
                  <div className="text-center rounded-[0.6rem] w-full h-full">
                    <div className="h-full text-black flex flex-col overflow-hidden items-center justify-center rounded-[0.4rem] font-semibold bg-white">
                      <div className="h-[128px] overflow-hidden number select-none">
                        <div style={{ margin: 0, padding: 0 }}>
                          {[...words, words[0]].map((word, indexWord) => (
                            <div
                              key={indexWord}
                              className="bg-white text-black"
                              data-value={indexWord >= words.length ? 0 : indexWord}
                              style={{
                                height: '128px',
                                display: 'block',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                fontSize: '3.75rem',
                                lineHeight: '128px',
                                margin: 0,
                                padding: 0,
                                border: 'none',
                                outline: 'none',
                                verticalAlign: 'top',
                              }}
                            >
                              {word}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Button */}
          <button
            className={`bg-[#FFC04A] text-white px-16 py-4 rounded-2xl min-w-[320px] shadow-xl transition-all ${
              isSpin ? "opacity-50 cursor-default" : "hover:scale-105"
            }`}
            onClick={handleSpiner}
          >
            <div className="text-4xl font-bold uppercase tracking-wide">
              {isWinner && winnerName ? "Quay lại" : "Bắt đầu"}
            </div>
          </button>
        </div>
      </div>
      <FireworkCanvas />
      <div
        className="fixed inset-0 bg-no-repeat bg-cover z-0"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      ></div>

      {isWinner && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <Confetti
            mode="boom"
            particleCount={250}
            x={0.5}
            y={0.5}
            colors={["#FF7F50", "#00FF00", "#FFC0CB", "#0000FF", "#FFFF00"]}
            launchSpeed={1.4}
          />
        </div>
      )}
    </>
  );
}

export default App;
