import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../lib/schemas";
import { useNavigate, Link } from "react-router-dom";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await signup(values);
      toast.success("Account created!");
      nav("/", { replace: true });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Create account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div>
              <div className="text-sm mb-1">Name</div>
              <Input {...register("name")} />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <div className="text-sm mb-1">Email</div>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="text-sm mb-1">Password</div>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <Button disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Sign up"}
            </Button>
          </form>
          <div className="text-sm mt-3">
            Already have an account? <Link to="/login" className="underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
