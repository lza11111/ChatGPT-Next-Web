import { NextRequest } from "next/server";
import { EndpointType } from "../store";
import { DbClient } from "./dbclient";

const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT ?? "api.openai.com";
const OPENAI_PATH = process.env.OPENAI_PATH ?? "/v1/chat/completions";

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get("token");
  const endpointType = req.headers.get("endpoint-type");
  let request_url = "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (endpointType === EndpointType.Private) {
    const res = await DbClient.queryBalance(apiKey!);
    if (res) {
      const { endpoint, path, api_key } = res;
      headers["api-key"] = api_key ?? "";
      request_url = `${PROTOCOL}://${endpoint}${path}`;
    } else {
      throw new Error("Invalid token");
    }
  }

  if (endpointType === EndpointType.OpenAI) {
    headers.Authorization = `Bearer ${apiKey}`;
    request_url = `${PROTOCOL}://${OPENAI_ENDPOINT}${OPENAI_PATH}`;
  }

  if (endpointType === EndpointType.AzureOpenAI) {
    headers["api-key"] = apiKey ?? "";
    const endpoint = req.headers.get("endpoint");
    const path = req.headers.get("path");
    request_url = `${PROTOCOL}://${endpoint}${path}`;
  }

  console.log("[Proxy] ", request_url);

  return fetch(request_url, {
    headers,
    method: req.method,
    body: req.body,
  });
}
