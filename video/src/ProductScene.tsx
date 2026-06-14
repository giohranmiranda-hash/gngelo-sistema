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

// Cena de foto do produto em destaque, com zoom suave (Ken Burns)
// e legenda. Se `content.productPhoto` estiver vazio, mostra um
// espaço reservado — assim a renderização nunca quebra.
export const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Zoom lento do início ao fim da cena.
  const scale = interpolate(frame, [0, durationInFrames], [1.08, 1.22]);
  const drift = interpolate(frame, [0, durationInFrames], [-1.5, 1.5]);

  const hasPhoto = content.productPhoto.trim().length > 0;

  const capEnter = spring({
    frame: frame - 12,
    fps,
    config: { damping: 16 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: brand.black, overflow: "hidden" }}>
      {/* Imagem (ou espaço reservado) com efeito Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${drift}%, ${drift}%)`,
        }}
      >
        {hasPhoto ? (
          <Img
            src={staticFile(content.productPhoto)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
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
            Coloque sua foto em
            <br />
            video/public/ e informe o
            <br />
            nome em src/content.ts
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* Escurecimento na base para a legenda ficar legível */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)",
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
            backdropFilter: "blur(4px)",
          }}
        >
          {content.productCaption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
