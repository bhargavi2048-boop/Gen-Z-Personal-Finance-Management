import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#14B8A6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'],
  });
};
