import api from "./api";

export async function listJobDescriptions() {
  const { data } = await api.get("/api/job-descriptions");
  return data;
}

export async function createJobDescription({ title, raw_text }) {
  const { data } = await api.post("/api/job-descriptions", { title, raw_text });
  return data;
}

export async function getJobDescription(jdId) {
  const { data } = await api.get(`/api/job-descriptions/${jdId}`);
  return data;
}

/** Ranks the signed-in user's candidates against this JD. No request body. */
export async function rankCandidates(jdId) {
  const { data } = await api.post(`/api/job-descriptions/${jdId}/rank`);
  return data;
}

export async function deleteJobDescription(jdId) {
  await api.delete(`/api/job-descriptions/${jdId}`);
}
