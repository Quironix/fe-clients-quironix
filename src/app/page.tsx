import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-4">
      <h1 className="text-2xl font-bold">Bienvenido a Quironix</h1>
      <Link href="/onboarding" className="bg-primary text-white px-4 py-2 rounded-md">
        Ir al onboarding
      </Link>
    </div>
  );
}
