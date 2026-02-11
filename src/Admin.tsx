import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseSync } from "./hooks/useFirebaseSync";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

interface GuaranteedWinner {
  id: number;
  name: string;
}

function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newWinnerName, setNewWinnerName] = useState("");

  // Firebase sync
  const {
    isLoading: isFirebaseLoading,
    words,
    guaranteedWinners,
    currentSpinCount,
    guaranteedWinnerIndex,
    syncGuaranteedWinners,
    syncSpinCount,
    syncGuaranteedWinnerIndex
  } = useFirebaseSync();

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('admin_logged_in', 'true');
    } else {
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('admin_logged_in');
    setUsername("");
    setPassword("");
  };

  const handleAddPresetWinner = () => {
    if (!newWinnerName.trim()) {
      alert('Vui lòng nhập tên người trúng thưởng!');
      return;
    }

    // Nếu là RANDOM thì không cần kiểm tra
    if (newWinnerName.trim().toUpperCase() !== 'RANDOM') {
      // Kiểm tra tên có tồn tại trong danh sách không
      const exists = words.find(w => w === newWinnerName.trim());
      if (!exists) {
        alert(`Tên "${newWinnerName.trim()}" không có trong danh sách!\nVui lòng chọn tên từ danh sách hiện tại hoặc nhập "RANDOM".`);
        return;
      }

      // Kiểm tra trùng (chỉ với tên thật, không phải RANDOM)
      const isDuplicate = guaranteedWinners.find(w => w.name === newWinnerName.trim());
      if (isDuplicate) {
        alert('Tên này đã có trong danh sách trúng thưởng!');
        return;
      }
    }

    const newId = guaranteedWinners.length > 0
      ? Math.max(...guaranteedWinners.map(w => w.id)) + 1
      : 1;

    const newWinner: GuaranteedWinner = {
      id: newId,
      name: newWinnerName.trim().toUpperCase() === 'RANDOM' ? 'RANDOM' : newWinnerName.trim(),
    };

    const updated = [...guaranteedWinners, newWinner];
    syncGuaranteedWinners(updated);
    setNewWinnerName("");
  };

  const handleDeleteWinner = (id: number) => {
    const updated = guaranteedWinners.filter(w => w.id !== id);
    syncGuaranteedWinners(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách người trúng thưởng đã set?')) {
      syncGuaranteedWinners([]);
      syncGuaranteedWinnerIndex(0);
    }
  };

  const handleResetUsedNumbers = () => {
    if (window.confirm('Bạn có chắc muốn reset lại danh sách đã quay?')) {
      localStorage.removeItem('used_numbers');
      syncSpinCount(0);
      syncGuaranteedWinnerIndex(0);
      alert('Đã reset thành công!');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🔐 Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">\n            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tài khoản
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-purple-500"
                placeholder="Nhập tài khoản"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-purple-500"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Quay lại trang chủ
            </button>
          </div>

          {/* <div className="mt-8 p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              <strong>Tài khoản mặc định:</strong><br />
              User: admin<br />
              Pass: admin123
            </p>
          </div> */}
        </div>
      </div>
    );
  }

  // Loading state while Firebase initializes
  if (isFirebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-xl font-semibold text-white">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">
              🎯 Admin Panel
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all"
              >
                Trang chủ
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - Add Winner */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ➕ Danh sách người sẽ trúng
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh sách tên hiện tại ({words.length} tên)
              </label>
              <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
                {words.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {words.map((word, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {idx + 1}. {word}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">Chưa có danh sách</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>💡 Cách hoạt động:</strong><br />
                  Thêm tên vào danh sách → Khi quay, hệ thống sẽ ưu tiên chọn tên từ danh sách này theo thứ tự thêm vào<br />
                  <strong>🎲 RANDOM:</strong> Nhập "RANDOM" để lượt đó quay ngẫu nhiên
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm tên vào danh sách trúng thưởng
                </label>
                <input
                  type="text"
                  value={newWinnerName}
                  onChange={(e) => setNewWinnerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên hoặc 'RANDOM'..."
                  list="words-datalist"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPresetWinner();
                    }
                  }}
                />
                <datalist id="words-datalist">
                  <option value="RANDOM" />
                  {words.map((word, idx) => (
                    <option key={idx} value={word} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddPresetWinner}
                  className="bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all"
                >
                  ➕ Thêm vào danh sách
                </button>
                <button
                  onClick={() => {
                    setNewWinnerName('RANDOM');
                    setTimeout(() => handleAddPresetWinner(), 100);
                  }}
                  className="bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all"
                >
                  🎲 Thêm RANDOM
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleResetUsedNumbers}
                className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all mb-3"
              >
                🔄 Reset danh sách đã quay
              </button>

              <button
                onClick={handleClearAll}
                className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all"
              >
                🗑️ Xóa toàn bộ danh sách
              </button>
            </div>
          </div>

          {/* Right Panel - List */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📋 Danh sách người sẽ trúng ({guaranteedWinners.length})
            </h2>

            {guaranteedWinners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  Chưa có người nào trong danh sách
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {guaranteedWinners.map((winner, index) => (
                  <div
                    key={winner.id}
                    className={`rounded-xl p-4 flex justify-between items-center ${
                      winner.name === 'RANDOM'
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100'
                    }`}
                  >
                    <div>
                      <span className={`text-lg font-bold ${
                        winner.name === 'RANDOM' ? 'text-orange-600' : 'text-purple-600'
                      }`}>
                        #{index + 1}:
                      </span>
                      <span className={`ml-3 text-xl font-semibold ${
                        winner.name === 'RANDOM' ? 'text-orange-800' : 'text-gray-800'
                      }`}>
                        {winner.name === 'RANDOM' ? '🎲 RANDOM (Ngẫu nhiên)' : winner.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteWinner(winner.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📖 Hướng dẫn sử dụng
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Bước 1:</strong> Thêm tên vào danh sách "người sẽ trúng" (phải có trong danh sách tên hiện tại)
            </li>
            <li>
              <strong>Bước 2:</strong> Khi quay ở trang chủ, hệ thống sẽ ưu tiên lấy tên từ danh sách theo thứ tự
            </li>
            <li>
              <strong>Thứ tự:</strong> Lượt 1 → Tên #1, Lượt 2 → Tên #2, ...
            </li>
            <li>
              <strong>🎲 RANDOM:</strong> Thêm "RANDOM" vào danh sách nếu muốn lượt đó quay ngẫu nhiên
            </li>
            <li>
              <strong>Reset:</strong> Nhấn "Reset danh sách đã quay" để quay lại từ đầu
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Admin;
