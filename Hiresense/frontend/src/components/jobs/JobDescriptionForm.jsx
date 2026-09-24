import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import Card from "../ui/Card";
import TextField from "../ui/TextField";
import { createJobDescription } from "../../services/jobService";
import { LuBriefcase } from "react-icons/lu";

export default function JobDescriptionForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      toast.error("Add a title and the job description text.");
      return;
    }
    setSubmitting(true);
    try {
      const jd = await createJobDescription({ title: title.trim(), raw_text: rawText.trim() });
      toast.success("Job description saved");
      setTitle("");
      setRawText("");
      onCreated?.(jd);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <span className="h-8 w-8 rounded-lg bg-accent-soft border border-accent/10 flex items-center justify-center shrink-0">
          <LuBriefcase className="h-4 w-4 text-accent" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display font-semibold text-sm text-ink">New job description</h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Required skills are extracted automatically once you save.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <TextField
          label="Role title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Full Stack Python Developer"
        />
        <TextField
          as="textarea"
          label="Description"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste the full job description here — required skills, experience level, responsibilities..."
          rows={7}
          hint="Paste the raw text. The more detail it contains, the better the skill extraction."
        />
        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? "Saving…" : "Save job description"}
        </Button>
      </form>
    </Card>
  );
}
