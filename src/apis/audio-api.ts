import { BASE_URL } from "./constants";

export async function getWatermarkedAudio(audio: string) {
  const formData = new FormData();
  formData.append("audio", audio);

  const res = await fetch(`${BASE_URL}/audio/watermark`, {
    method: "POST",
    body: formData,
  });
  const json: { message: string; path: string } = await res.json();

  return json.path;
}

export async function detectWatermarkedAudio(audio: string) {
  const formData = new FormData();
  formData.append("audio", audio);

  const res = await fetch(`${BASE_URL}/audio/watermark/detect`, {
    method: "POST",
    body: formData,
  });
  const json: { message: string; result: boolean } = await res.json();

  return json.result;
}
