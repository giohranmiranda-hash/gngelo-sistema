import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";
import { content } from "./content";
import { Background } from "./Background";
import { ProductScene } from "./ProductScene";

// Composição única que se adapta ao tamanho do vídeo (9:16 ou 1:1).
// As medidas de fonte usam `u` (1% da menor dimensão) para escalar bem
// tanto no Reel vertical quanto no Feed quadrado.

const useUnit = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 100;
};

// ── Cena 1: abertura com a marca ──────────────────────────────
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();

  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  const scale = interpolate(pop, [0, 1], [0.6, 1]);
  const subOpacity = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: u * 2 }}
    >
      <div
        style={{
          fontSize: u * 30,
          fontWeight: 800,
          letterSpacing: u * 0.5,
          transform: `scale(${scale})`,
          background: brand.goldGradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {content.brandTop}
      </div>
      <div
        style={{
          fontSize: u * 5,
          fontWeight: 600,
          letterSpacing: u * 1.2,
          color: brand.goldLight,
          opacity: subOpacity,
        }}
      >
        {content.brandSubtitle}
      </div>
    </AbsoluteFill>
  );
};

// ── Cena 2: frase de impacto, palavra por palavra ─────────────
const HeadlineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: u * 8,
      }}
    >
      <div style={{ textAlign: "center", lineHeight: 1.05 }}>
        {content.headline.map((word, i) => {
          const start = i * 10;
          const enter = spring({
            frame: frame - start,
            fps,
            config: { damping: 14 },
          });
          const y = interpolate(enter, [0, 1], [u * 6, 0]);
          const accent = i === 1; // segunda palavra em dourado
          return (
            <div
              key={word}
              style={{
                fontSize: u * 11,
                fontWeight: 800,
                opacity: enter,
                transform: `translateY(${y}px)`,
                color: accent ? "transparent" : brand.white,
                background: accent ? brand.goldGradient : undefined,
                WebkitBackgroundClip: accent ? "text" : undefined,
                backgroundClip: accent ? "text" : undefined,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Cena 3: diferenciais ──────────────────────────────────────
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: u * 4,
        padding: u * 8,
      }}
    >
      {content.features.map((feat, i) => {
        const start = i * 18;
        const enter = spring({
          frame: frame - start,
          fps,
          config: { damping: 16 },
        });
        const x = interpolate(enter, [0, 1], [-u * 8, 0]);
        return (
          <div
            key={feat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: u * 2.5,
              opacity: enter,
              transform: `translateX(${x}px)`,
            }}
          >
            <div
              style={{
                width: u * 5,
                height: u * 5,
                borderRadius: "50%",
                background: brand.goldGradient,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: brand.black,
                fontSize: u * 3,
                fontWeight: 800,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: u * 5.5,
                fontWeight: 600,
                color: brand.white,
              }}
            >
              {feat}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Cena 4: chamada final ─────────────────────────────────────
const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = useUnit();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + 0.04 * Math.sin(frame / 6);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: u * 4 }}
    >
      <div
        style={{
          fontSize: u * 8,
          fontWeight: 800,
          color: brand.white,
          opacity: pop,
          transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
        }}
      >
        {content.ctaLine}
      </div>
      <div
        style={{
          marginTop: u * 2,
          padding: `${u * 2.5}px ${u * 6}px`,
          borderRadius: u * 10,
          background: brand.goldGradient,
          color: brand.black,
          fontSize: u * 5.5,
          fontWeight: 800,
          opacity: pop,
          transform: `scale(${pulse})`,
        }}
      >
        {content.handle}
      </div>
    </AbsoluteFill>
  );
};

export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: brand.fontFamily }}>
      <Background />
      <Sequence durationInFrames={75}>
        <IntroScene />
      </Sequence>
      <Sequence from={75} durationInFrames={105}>
        <HeadlineScene />
      </Sequence>
      {/* Foto do produto tem fundo próprio, então cobre o Background */}
      <Sequence from={180} durationInFrames={120}>
        <ProductScene />
      </Sequence>
      <Sequence from={300} durationInFrames={150}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={450} durationInFrames={120}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// Duração total em frames (usada pelas duas composições).
export const PROMO_DURATION = 570;
