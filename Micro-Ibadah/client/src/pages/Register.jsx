import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    password: ""
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(formData);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <CardTitle className="text-2xl">Join the Community</CardTitle>
          <CardDescription>Create your Micro-Ibadah student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm text-error bg-error/10 rounded-lg border border-error/30">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-base-content">Full Name</label>
                <Input name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-base-content">Student ID</label>
                <Input name="studentId" required value={formData.studentId} onChange={handleChange} placeholder="2010...12" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content">Department</label>
              <Input name="department" required value={formData.department} onChange={handleChange} placeholder="CSE" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content">University Email</label>
              <Input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="student@gub.edu.bd" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content">Password</label>
              <Input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" minLength={6} />
            </div>
            
            <Button type="submit" className="w-full h-11 font-semibold mt-4">Create Account</Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-base-content/70">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
