import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { completeOnboarding } from "../services/api";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleCompleteSetup = async () => {
    try {
      const updatedUser = await completeOnboarding();
      const resolvedId = updatedUser?._id || updatedUser?.id;
      setUser({
        ...updatedUser,
        _id: resolvedId,
        id: resolvedId,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] text-center px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome, {user?.name?.split(' ')[0]}!</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        Let's set up your personalized Ramadan routine. Don't worry, you can always change these later.
      </p>

      {/* Placeholder logic until Step-by-Step UI is built in Phase 2 */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl max-w-lg w-full mb-6">
        <h3 className="font-bold text-indigo-900 mb-2">Setup Placeholder</h3>
        <p className="text-sm text-indigo-700/80 mb-4">
          The full drag-and-drop routine builder is coming in the next update. For now, we've loaded the recommended student preset.
        </p>
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold text-white"
          onClick={handleCompleteSetup}
        >
          Complete Setup & Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
