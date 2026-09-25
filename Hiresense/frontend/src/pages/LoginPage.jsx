import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef(null);

  // Keyboard users shouldn't have to hunt for the field that failed -
  // move focus to the first invalid input after a rejected submit.
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
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      toast.success("Welcome back");
      // Send them back to wherever the route guard intercepted them.
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your candidate pipeline and screening results."
      footer={
        <>
          New to HireSense?{" "}
          <Link to="/register" className="text-accent font-semibold hover:underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
        <p aria-live="polite" className="sr-only">
          {errorCount > 0 ? `${errorCount} field${errorCount > 1 ? "s" : ""} need attention.` : ""}
        </p>

        <AuthField
          label="Email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          placeholder="you@company.com"
          error={errors.email}
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          type="password"
          value={form.password}
          onChange={setField("password")}
          placeholder="Enter your password"
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div className="pt-1">
          <Button type="submit" loading={submitting} className="w-full" size="lg">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
