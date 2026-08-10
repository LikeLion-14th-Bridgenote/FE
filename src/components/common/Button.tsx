import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded-lg text-sm font-medium border transition-colors";
  const styles = {
    primary: "bg-primary text-white border-primary hover:opacity-90",
    secondary: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
    danger: "bg-white text-red-500 border-red-300 hover:bg-red-50",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
