import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import PasswordStrength from "../components/auth/PasswordStrength";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef(null);

  // Same focus behaviour as /login: land the caret on the first field that
  // failed instead of making the user tab through the whole form.
  useEffect(() => {
    if (!attempted) return;
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [attempted, errors]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";

    // Mirrors the backend's min_length=8 so the user gets instant feedback
    // instead of a round-trip 422.
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";

    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || null,
      });
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start screening, scoring and ranking resumes in a few minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-semibold hover:underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
        <p aria-live="polite" className="sr-only">
          {errorCount > 0 ? `${errorCount} field${errorCount > 1 ? "s" : ""} need attention.` : ""}
        </p>

        <AuthField
          label="Full name"
          value={form.full_name}
          onChange={setField("full_name")}
          placeholder="Your name"
          autoComplete="name"
          hint="Optional - used to label your account."
        />
        <AuthField
          label="Work email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          placeholder="you@company.com"
          error={errors.email}
          autoComplete="email"
          required
        />

        <div>
          <AuthField
            label="Password"
            type="password"
            value={form.password}
            onChange={setField("password")}
            placeholder="At least 8 characters"
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <PasswordStrength password={form.password} />
        </div>

        <AuthField
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={setField("confirmPassword")}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <div className="pt-1">
          <Button type="submit" loading={submitting} className="w-full" size="lg">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
