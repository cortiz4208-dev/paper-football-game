import type { ScorePopup } from '../types/game';

interface ScorePopupsProps {
  popups: ScorePopup[];
}

export default function ScorePopups({ popups }: ScorePopupsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {popups.map(popup => {
        const age = (Date.now() - popup.createdAt) / 1200;
        const opacity = 1 - age;
        const translateY = -age * 60;

        return (
          <div
            key={popup.id}
            className="absolute font-bold text-yellow-300 text-3xl"
            style={{
              left: `${popup.x * 100}%`,
              top: `${popup.y * 100}%`,
              transform: `translate(-50%, ${translateY}px) scale(${1 + age * 0.3})`,
              opacity: Math.max(0, opacity),
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              transition: 'none',
            }}
          >
            +{popup.value}
            {popup.label && (
              <div className="text-sm bg-green-500 text-white px-2 py-0.5 rounded mt-1 text-center">
                {popup.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
