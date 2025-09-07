import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedSection from "@/components/AnimatedSection";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (mounted) setMe(data);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Example: update name + profile.location + measurements
      const name = e.target.name.value;
      const location = e.target.location.value;
      const height = e.target.height_cm.value;

      const patch = {
        name,
        "profile.location": location,
        "profile.measurements.height_cm": height ? Number(height) : null,
      };
      await api.patch("/api/user/profile", patch);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Welcome, {me.name || me.email}</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => (window.location.href = "/results")}>
              View Results
            </Button>
            <Button onClick={logout}>Logout</Button>
          </div>
        </header>

        <AnimatedSection animationType="slideInUp">
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm">Name</label>
                  <Input name="name" defaultValue={me.name || ""} />
                </div>
                <div>
                  <label className="text-sm">Location</label>
                  <Input name="location" defaultValue={me.profile?.location || ""} />
                </div>
                <div>
                  <label className="text-sm">Height (cm)</label>
                  <Input name="height_cm" defaultValue={me.profile?.measurements?.height_cm || ""} />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button disabled={saving} type="submit">
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* You can add more cards here: Style, Notifications, Saved Outfits, etc. */}
      </div>
    </div>
  );
}
