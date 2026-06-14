import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { brand } from "./brand";

// Fundo escuro premium com leve brilho dourado que respira.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(
    Math.sin(frame / 40),
    [-1, 1],
    [0.25, 0.55]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: brand.black }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, rgba(201,168,76,${glow}) 0%, rgba(10,10,10,0) 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
