import { NextRequest } from "next/server";

const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const endpointType = req.headers.get("endpoint-type");
  const endpoint = req.headers.get("endpoint");
  const openaiPath = req.headers.get("path");

  const request_url = `${PROTOCOL}://${endpoint}${openaiPath}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (endpointType === 'OpenAI') {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  if (endpointType === 'Azure') {
    headers["api-key"] = apiKey ?? "";
  }

  console.log("[Proxy] ", request_url);

  return fetch(request_url, {
    headers,
    method: req.method,
    body: req.body,
  });
}
