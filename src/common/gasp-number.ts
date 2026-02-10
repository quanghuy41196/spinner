import gsap from "gsap";

const LOOP = 6; // Tăng số vòng quay để quay lâu hơn
const FINAL_LOOP = 20; // Số vòng quay phụ cho vòng cuối để quay chậm hơn - 20 vòng đầy đủ

export const calculator = (num: number) => `-${(num / 11) * 100}%`;

export interface IGsapOnePayload {
  elem: HTMLDivElement;
  number: number;
  onComplete: () => void;
  reset?: boolean;
  onAlmostFinished?: (progress: number) => void;
}

export const gsapOne = ({
  elem,
  number,
  onComplete,
  reset = false,
  onAlmostFinished,
}: IGsapOnePayload) => {
  // Vòng đầu - quay đều
  if (!reset) {
    gsap.to(elem, {
      y: calculator(10),
      duration: 3.5,
      ease: "none",
      stagger: 0.2,
      repeat: LOOP,
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
          onAlmostFinished
        });
      },
    });
    return;
  }

  // Vòng cuối - chia thành nhiều đoạn chậm dần
  const tl = gsap.timeline({
    onComplete: () => {
      onComplete();
    }
  });

  const totalDistance = 10 * FINAL_LOOP + number;
  const segment1 = totalDistance * 0.4; // 40% quãng đường
  const segment2 = totalDistance * 0.25; // 25% quãng đường
  const segment3 = totalDistance * 0.2; // 20% quãng đường
  const segment4 = totalDistance * 0.08; // 8% quãng đường
  const segment5 = totalDistance * 0.04; // 4% quãng đường
  const segment6 = totalDistance * 0.02; // 2% quãng đường
  // 1% quãng đường cuối sẽ được quay trong animation cuối cùng

  tl.to(elem, {
    y: calculator(segment1),
    duration: 5,
    ease: "none",
  })
  .to(elem, {
    y: calculator(segment1 + segment2),
    duration: 6,
    ease: "power1.out",
  })
  .to(elem, {
    y: calculator(segment1 + segment2 + segment3),
    duration: 8,
    ease: "power2.out",
  })
  .to(elem, {
    y: calculator(segment1 + segment2 + segment3 + segment4),
    duration: 12,
    ease: "power2.out",
  })
  .to(elem, {
    y: calculator(segment1 + segment2 + segment3 + segment4 + segment5),
    duration: 18,
    ease: "power3.out",
  })
  .to(elem, {
    y: calculator(segment1 + segment2 + segment3 + segment4 + segment5 + segment6),
    duration: 25,
    ease: "power4.out",
    onUpdate: function() {
      const progress = this.progress();
      if (progress >= 0.3) {
        onAlmostFinished?.(0.9 + progress * 0.1);
      }
    }
  })
  .to(elem, {
    y: calculator(totalDistance),
    duration: 35, // 35 giây cho 1% cuối - từ từ "bò" đến đích
    ease: "sine.out", // Ease mềm mại nhất, không dừng đột ngột
  });
};
