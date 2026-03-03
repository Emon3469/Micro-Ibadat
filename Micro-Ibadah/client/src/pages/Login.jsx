import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { user } = await login(email, password);
      if (user.onboardingComplete) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Log in to your Micro-Ibadah account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-error bg-error/10 rounded-lg border border-error/30">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content">University Email</label>
              <Input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gub.edu.bd" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content">Password</label>
              <Input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
              />
            </div>
            
            <Button type="submit" className="w-full h-11 font-semibold mt-2">Log In</Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-base-content/70">
            Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
