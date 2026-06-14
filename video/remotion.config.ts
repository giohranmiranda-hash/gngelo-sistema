import { Config } from "@remotion/cli/config";

// Vídeos da GN Gelo para Instagram.
// H.264 em MP4 é o formato aceito por Reels e Feed.
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setOverwriteOutput(true);
