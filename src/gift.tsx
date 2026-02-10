import { useEffect, useRef, useState } from "react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { DEFAULT_WORDS } from "./constants";

const Gift = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dataGuaranteed, setDataGuaranteed] = useState<number[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const MAX_INDEX = words.length - 1;

  const refreshData = () => {
    const data: number[] = JSON.parse(localStorage.getItem('guaranteed_numbers') || '[]');
    setDataGuaranteed(data);

    const savedWords = localStorage.getItem('spinner_words');
    setWords(savedWords ? JSON.parse(savedWords) : DEFAULT_WORDS);
  };

  const refreshInput = () => {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.focus();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAdd = () => {
    const value = inputRef.current?.value;
    if (!value) {
      refreshInput();
      return;
    }
    const newValue = +value;
    if (newValue < 0 || newValue > MAX_INDEX) {
      alert(`Vui lòng nhập số từ 0 đến ${MAX_INDEX}`);
      refreshInput();
      return;
    }

    // Kiểm tra trùng
    if (dataGuaranteed.includes(newValue)) {
      alert('Số này đã tồn tại!');
      refreshInput();
      return;
    }

    const updated = [...dataGuaranteed, newValue];
    localStorage.setItem('guaranteed_numbers', JSON.stringify(updated));
    refreshData();
    refreshInput();
  };

  const handleRemove = (num: number) => {
    const updated = dataGuaranteed.filter(n => n !== num);
    localStorage.setItem('guaranteed_numbers', JSON.stringify(updated));
    refreshData();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-5">
      <div className="flex items-center gap-5">
        <Input
          type="number"
          className="w-[200px]"
          placeholder={`Index: 0 - ${MAX_INDEX}`}
          required
          max={MAX_INDEX}
          min={0}
          ref={inputRef}
        />
        <Button onClick={handleAdd}>Thêm</Button>
      </div>
      <div className="max-h-[300px] space-y-5 overflow-y-auto px-3">
        {dataGuaranteed?.map((item, index) => {
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

export default Gift;
