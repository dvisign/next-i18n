import {bypass, HttpResponse} from "msw";

export async function initMock() {
  if (import.meta.env?.MODE !== "production" && typeof window !== "undefined") {
    const {worker} = await import("./browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
  return Promise.resolve(true);
}

export function apiEndpoints(url) {
  const baseUrl =
    import.meta.env?.VITE_PUBLIC_API_URL || "http://localhost:9000";
  return `${baseUrl}${url}`;
}

export async function mswBypass(request) {
  const req = bypass(request); // 클론된 Request를 사용
  const url = new URL(request.url);
  const urlPath = `${url.pathname}${url.search}`;
  const method = request.method;
  const bodyContent =
    request.bodyUsed === false ? await request.text() : undefined;
  const resOptions = {
    url: urlPath,
    method,
    headers: Object.fromEntries(req.headers.entries()),
  };
  if (bodyContent && method === "POST") {
    resOptions.data = JSON.parse(bodyContent);
  }
  const response = await fetch(resOptions);
  return response; // axios 형식으로 반환
}

export const SECRET = "test-secret"; // 테스트용 비밀 키

// Base64Url Encoding Helper
export const base64UrlEncode = (input) => {
  return btoa(JSON.stringify(input))
    .replace(/=/g, "") // '=' 제거
    .replace(/\+/g, "-") // '+' -> '-'
    .replace(/\//g, "_"); // '/' -> '_'
};

// 단순 해싱 (SHA256 대체)
export const createSignature = (header, payload, secret) => {
  return base64UrlEncode(`${header}.${payload}.${secret}`);
};

// JWT 생성 함수
export const createJWT = (payload, secret = "test-secret") => {
  const header = base64UrlEncode({alg: "HS256", typ: "JWT"});
  const payloadEncoded = base64UrlEncode(payload);
  const signature = createSignature(header, payloadEncoded, secret);
  return `${header}.${payloadEncoded}.${signature}`;
};

// JWT 검증 함수
export const verifyJWT = (token, secret) => {
  try {
    const [header, payload, signature] = token.split(".");
    const validSignature = createSignature(header, payload, secret);
    if (signature !== validSignature) {
      return false; // 서명이 유효하지 않음
    }
    const decodedPayload = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    if (decodedPayload.exp && decodedPayload.exp <= now) {
      return false; // 토큰 만료
    }
    return true; // 토큰 유효
  } catch {
    return false; // 잘못된 토큰 형식
  }
};

export const handleApiRequest = async (
  request,
  data = {},
  req = {},
  options = {verifyToken: true}
) => {
  try {
    const result = await mswBypass(request);
    return HttpResponse.json(
      result.data, // body에 JSON 데이터를 설정
      {
        status: result.status, // 상태 코드
        headers: result.headers, // 헤더
      }
    );
  } catch (error) {
    if (!error?.response) {
      console.log("Bypass failed. Returning mock data.", request.url);
      // Mock 데이터 반환
      return HttpResponse.json(data, req);
    }
    return HttpResponse.json(error?.response?.data, {
      status: error.response.status,
    });
  }
};
