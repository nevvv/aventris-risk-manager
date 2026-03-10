import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background to-background">
      <div className="glass-card max-w-md w-full p-8 text-center rounded-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-display font-bold text-white mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
