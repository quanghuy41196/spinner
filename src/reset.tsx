import { useEffect, useState } from "react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { DEFAULT_WORDS } from "./constants";

const Reset = () => {
  const [dataUsedNumbers, setDataUsedNumbers] = useState<number[]>([]);
  const [words, setWords] = useState<string[]>([]);

  const refreshData = () => {
    const data: number[] = JSON.parse(localStorage.getItem('used_numbers') || '[]');
    setDataUsedNumbers(data);

    const savedWords = localStorage.getItem('spinner_words');
    setWords(savedWords ? JSON.parse(savedWords) : DEFAULT_WORDS);
  };

  const handleRemove = (num: number) => {
    const updated = dataUsedNumbers.filter(n => n !== num);
    localStorage.setItem('used_numbers', JSON.stringify(updated));
    refreshData();
  };

  const handleRemoveAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả?')) {
      localStorage.setItem('used_numbers', '[]');
      refreshData();
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="flex flex-col items-center p-5 gap-5">
      <div className="flex justify-end">
        <Button
          onClick={handleRemoveAll}
        >
          Xóa tất cả
        </Button>
      </div>
      <div className="max-h-[300px] space-y-5 overflow-y-auto px-3">
        {dataUsedNumbers?.map((item, index) => {
          const word = words[item] || "N/A";
          return (
            <div key={index} className="flex items-center gap-5">
              <Input className="w-[200px]" value={`${item} - ${word}`} readOnly />
              <Button
                className="min-w-[67px]"
                onClick={() => handleRemove(item)}
                variant={"destructive"}
              >
                Xóa
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reset;
