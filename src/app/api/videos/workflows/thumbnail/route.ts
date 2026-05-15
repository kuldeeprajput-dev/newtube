import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const { userId, videoId, prompt } = context.requestPayload as InputType;

  const video = await context.run("get-video", async () => {
    const result = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!result[0]) {
      throw new Error("Video not found");
    }

    return result[0];
  });

  const transcript = await context.run("get-transcript", async () => {
    if (!video.muxPlaybackId || !video.muxTrackId) {
      return "";
    }

    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    try {
      const res = await fetch(trackUrl);
      if (!res.ok) return "";
      const text = await res.text();
      return text.trim();
    } catch {
      return "";
    }
  });

  const thumbnailUrl = await context.run("generate-thumbnail", async () => {
    const transcriptContext = transcript
      ? `\nContext from video transcript: ${transcript.slice(0, 1000)}...`
      : "";

    const enhancedPrompt = `
YouTube thumbnail, ultra high quality, cinematic lighting,
bold colors, expressive face, clean background,
large readable text, professional YouTube style,
landscape orientation, 16:9 aspect ratio, wide format.
Prompt: ${prompt}${transcriptContext}
    `.trim();

    const res = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            width: 1280,
            height: 720,
          },
        }),
      },
    );

    if (!res.ok) {
      console.error("Image generation failed:", await res.text());
      throw new Error("Thumbnail generation failed");
    }

    const imageBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  });

  if (!thumbnailUrl) {
    throw new Error("No thumbnail generated");
  }

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ thumbnailUrl })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });
});
