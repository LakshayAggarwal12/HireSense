import api from "./api";

/** Lists the signed-in user's candidates, each with their latest ATS report. */
export async function listCandidates() {
  const { data } = await api.get("/api/candidates");
  return data;
}

export async function uploadResume(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/upload-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function getCandidate(candidateId) {
  const { data } = await api.get(`/api/candidates/${candidateId}`);
  return data;
}

export async function getAtsReport(candidateId) {
  const { data } = await api.get(`/api/candidates/${candidateId}/ats-report`);
  return data;
}

export async function getMatchScore(candidateId, jdId) {
  const { data } = await api.get(`/api/candidates/${candidateId}/match/${jdId}`);
  return data;
}

export async function deleteCandidate(candidateId) {
  await api.delete(`/api/candidates/${candidateId}`);
}

/** Detected professional field(s) for a candidate, by weighted skill relevance. */
export async function getDetectedField(candidateId) {
  const { data } = await api.get(`/api/candidates/${candidateId}/detected-field`);
  return data;
}
