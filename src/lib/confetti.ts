import confetti from 'canvas-confetti';

export function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    void confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#8a2be2', '#c49bff', '#f0e6ff', '#d8a9ee'],
    });
    void confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#8a2be2', '#c49bff', '#f0e6ff', '#d8a9ee'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
