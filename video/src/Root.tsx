import { Composition } from "remotion";
import { FPS } from "./brand";
import { PromoVideo, PROMO_DURATION } from "./PromoVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Reels / Stories — vertical 9:16 */}
      <Composition
        id="PromoReel"
        component={PromoVideo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Feed — quadrado 1:1 */}
      <Composition
        id="PromoFeed"
        component={PromoVideo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
