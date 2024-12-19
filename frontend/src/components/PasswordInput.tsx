import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<
  HTMLInputElement,
  { placeholder: string; id?: string; className?: string }
>(({ placeholder, id, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-9 w-full rounded-md border border-input bg-background shadow-sm transition-colors placeholder:text-muted-foreground focus-within:ring-1 ring-ring",
        className
      )}
    >
      <Input
        className="h-auto border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 bg-transparent w-full"
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        ref={ref}
        id={id}
        {...props}
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        className="px-1 py-1 cursor-pointer absolute inset-y-0 right-0 flex items-center"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </span>
    </div>
  );
});

export default PasswordInput;
