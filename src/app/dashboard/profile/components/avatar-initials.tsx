"use client";

interface AvatarInitialsProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-xl",
  lg: "w-24 h-24 text-3xl",
};

const AvatarInitials = ({
  firstName,
  lastName,
  size = "lg",
}: AvatarInitialsProps) => {
  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-slate-600 text-white flex items-center justify-center font-bold select-none shrink-0`}
    >
      {initials}
    </div>
  );
};

export default AvatarInitials;
