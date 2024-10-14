import { GLIFResponse } from "@/app";

const GLIF_API_TOKEN = import.meta.env.VITE_GLIF_API_TOKEN;

const GLIF_SERVER_URL =
  import.meta.env.PROD === true
    ? "https://simple-api.glif.app"
    : "http://localhost:8010/proxy";

const GLIF_IMAGE_GENERATOR_ID = import.meta.env.VITE_GLIF_IMAGE_GENERATOR_ID;
const GLIF_PROMPT_OPTIMIZER_ID = import.meta.env.VITE_GLIF_PROMPT_OPTIMIZER_ID;

console.log(import.meta.env.PROD === true ? "PRODUCTION" : "DEVELOPMENT");
console.log("GLIF SERVER", GLIF_SERVER_URL);
console.log("PROMPT OPTIMIZATION ID", GLIF_PROMPT_OPTIMIZER_ID);
console.log("IMAGE GENERATION ID", GLIF_IMAGE_GENERATOR_ID);

export const optimizePrompt = async (prompt: string) => {
  console.log("optimize prompt", prompt);

  const data = {
    id: GLIF_PROMPT_OPTIMIZER_ID,
    inputs: [prompt],
  };

  const response = await fetch(`${GLIF_SERVER_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLIF_API_TOKEN}`,
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(data),
  });

  const responseData: GLIFResponse = await response.json();

  return responseData;
};

export const generateImage = async (prompt: string) => {
  console.log("generate image", prompt);

  const data = {
    id: GLIF_IMAGE_GENERATOR_ID,
    inputs: [prompt],
  };

  const response = await fetch(`${GLIF_SERVER_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GLIF_API_TOKEN}`,
      "Content-Type": `application/json`,
    },
    body: JSON.stringify(data),
  });
  const responseData: GLIFResponse = await response.json();
  return responseData;
};
