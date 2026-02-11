import gsap from "gsap";

export const calculator = (num: number, totalItems: number = 11) =>
  `-${(num / totalItems) * 100}%`;

export interface IGsapOnePayload {
  elem: HTMLDivElement;
  number: number;
  onComplete: () => void;
  reset?: boolean;
  onAlmostFinished?: (progress: number) => void;
  totalDuration?: number; // Tổng thời gian quay (giây), mặc định 10
  itemCount?: number; // Số lượng items trong danh sách (không tính bản sao cuối)
}

export const gsapOne = ({
  elem,
  number,
  onComplete,
  reset = false,
  onAlmostFinished,
  totalDuration = 10,
  itemCount = 10,
}: IGsapOnePayload) => {
  const totalItems = itemCount + 1; // +1 cho bản sao item đầu tiên ở cuối

  // Phân bổ thời gian: 30% cho vòng đầu (quay nhanh), 70% cho vòng cuối (giảm tốc)
  const phase1Duration = totalDuration * 0.3;
  const phase2Duration = totalDuration * 0.7;

  // Tính số vòng lặp dựa trên thời gian
  const loopCount = Math.max(1, Math.round(totalDuration / 5));
  const singleLoopDuration = phase1Duration / (loopCount + 1);

  // Vòng đầu - quay đều, tốc độ không đổi
  if (!reset) {
    gsap.to(elem, {
      y: calculator(itemCount, totalItems),
      duration: singleLoopDuration,
      ease: "none",
      stagger: 0.2,
      repeat: loopCount,
      onUpdate: function () {
        const progress = this.progress();
        if (progress >= 0.9) {
          onAlmostFinished?.(progress);
        }
      },
      onComplete: () => {
        gsap.set(elem, { y: 0 });
        gsapOne({
          elem,
          number,
          onComplete,
          reset: true,
          onAlmostFinished,
          totalDuration,
          itemCount,
        });
      },
    });
    return;
  }

  // Vòng cuối - nhiều vòng quay chậm dần + đoạn cuối tiến đến đích
  // Mỗi full cycle: y từ 0 -> calculator(itemCount), rồi set lại y=0 (liền mạch vì item cuối = item đầu)
  const tl = gsap.timeline({
    onComplete: () => {
      onComplete();
    },
  });

  // Số vòng full cycle trong pha giảm tốc
  const decelerateCycles = Math.max(2, Math.round(phase2Duration / 2));
  const cycleTimeBudget = phase2Duration * 0.55; // 55% thời gian cho các vòng giảm tốc
  const finalApproachTime = phase2Duration * 0.45; // 45% thời gian cho đoạn cuối tiến đến đích

  // Tính duration cho từng vòng (tăng dần = chậm dần)
  // Dùng tổng cấp số cộng: 1 + 2 + 3 + ... + n = n(n+1)/2
  const sumWeights = (decelerateCycles * (decelerateCycles + 1)) / 2;

  for (let i = 0; i < decelerateCycles; i++) {
    const weight = i + 1; // vòng sau chậm hơn vòng trước
    const cycleDuration = (cycleTimeBudget * weight) / sumWeights;
    const ease = i < decelerateCycles / 2 ? "none" : "power1.out";

    tl.to(elem, {
      y: calculator(itemCount, totalItems),
      duration: cycleDuration,
      ease,
    });

    // Reset về 0 (liền mạch vì item cuối = bản sao item đầu)
    tl.set(elem, { y: 0 });
  }

  // Đoạn cuối - tiến chậm đến vị trí đích
  if (number === 0) {
    // Nếu đích là item 0, chỉ cần 1 vòng chậm cuối
    tl.to(elem, {
      y: calculator(itemCount, totalItems),
      duration: finalApproachTime,
      ease: "power3.out",
      onUpdate: function () {
        const progress = this.progress();
        if (progress >= 0.3) {
          onAlmostFinished?.(0.9 + progress * 0.1);
        }
      },
    });
  } else {
    // Quay thêm phần cuối: 1 vòng nhanh + tiến chậm đến đích
    const lastFullCycleTime = finalApproachTime * 0.3;
    const approachTime = finalApproachTime * 0.7;

    tl.to(elem, {
      y: calculator(itemCount, totalItems),
      duration: lastFullCycleTime,
      ease: "power1.out",
    });
    tl.set(elem, { y: 0 });
    tl.to(elem, {
      y: calculator(number, totalItems),
      duration: approachTime,
      ease: "power3.out",
      onUpdate: function () {
        const progress = this.progress();
        if (progress >= 0.3) {
          onAlmostFinished?.(0.9 + progress * 0.1);
        }
      },
    });
  }
};
