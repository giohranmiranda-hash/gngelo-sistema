import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";
import { content } from "./content";

// Cena de fotos do produto em destaque: carrossel com zoom suave
// (Ken Burns) e crossfade entre as imagens, mais uma legenda fixa.
// Se a lista `content.productPhotos` estiver vazia, mostra um espaço
// reservado — assim a renderização nunca quebra.

const CROSSFADE = 15; // frames de transição entre fotos

const PhotoSlide: React.FC<{ src: string; localFrame: number; slideLen: number }> = ({
  src,
  localFrame,
  slideLen,
}) => {
  // Zoom lento ao longo do slide.
  const scale = interpolate(localFrame, [0, slideLen], [1.08, 1.22]);
  const drift = interpolate(localFrame, [0, slideLen], [-1.5, 1.5]);
  // Aparece e some suavemente.
  const opacity = interpolate(
    localFrame,
    [0, CROSSFADE, slideLen - CROSSFADE, slideLen],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale}) translate(${drift}%, ${drift}%)` }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      background:
        "repeating-linear-gradient(45deg, #1A1A1A 0 40px, #141414 40px 80px)",
      color: brand.gold,
      fontSize: 36,
      fontWeight: 700,
      textAlign: "center",
      padding: 60,
    }}
  >
    Adicione fotos em video/public/
    <br />e liste em src/content.ts
  </AbsoluteFill>
);

export const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const photos = content.productPhotos;
  const hasPhotos = photos.length > 0;
  const slideLen = hasPhotos ? durationInFrames / photos.length : durationInFrames;
  const current = hasPhotos
    ? Math.min(photos.length - 1, Math.floor(frame / slideLen))
    : 0;

  const capEnter = spring({ frame: frame - 12, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.black, overflow: "hidden" }}>
      {hasPhotos ? (
        <PhotoSlide
          src={photos[current]}
          localFrame={frame - current * slideLen}
          slideLen={slideLen}
        />
      ) : (
        <Placeholder />
      )}

      {/* Escurecimento na base para a legenda ficar legível */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Legenda */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: "12%",
        }}
      >
        <div
          style={{
            opacity: capEnter,
            transform: `translateY(${interpolate(capEnter, [0, 1], [40, 0])}px)`,
            padding: "16px 36px",
            borderRadius: 999,
            border: `2px solid ${brand.gold}`,
            background: "rgba(10,10,10,0.55)",
            color: brand.goldLight,
            fontSize: 40,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {content.productCaption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
