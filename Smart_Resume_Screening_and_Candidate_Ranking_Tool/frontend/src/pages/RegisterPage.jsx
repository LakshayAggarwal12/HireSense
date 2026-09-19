import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
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
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || null,
      });
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start screening and ranking candidates in a few minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Full name (optional)"
          value={form.full_name}
          onChange={setField("full_name")}
          placeholder="Your name"
          autoComplete="name"
        />
        <AuthField
          label="Email"
          type="email"
          value={form.email}
          onChange={setField("email")}
          placeholder="you@company.com"
          error={errors.email}
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type="password"
          value={form.password}
          onChange={setField("password")}
          placeholder="At least 8 characters"
          error={errors.password}
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={setField("confirmPassword")}
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" loading={submitting} className="w-full" size="lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
