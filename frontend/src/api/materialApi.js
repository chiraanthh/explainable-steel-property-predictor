const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080";

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "The prediction service returned an error.");
  }

  return data;
}

export function predictMaterial(payload) {
  return postJson("/predict", payload);
}

export function explainMaterial(payload) {
  return postJson("/explain", payload);
}
