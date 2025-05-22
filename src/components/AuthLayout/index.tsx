import { useAuthLayout } from "@/stores/authLayout";
import Loader from "../Loader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthLayout();

  return (
    <>
      <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-[#1241AC] p-10 text-white lg:flex overflow-hidden">
          {/* Fondo con el isotipo grande */}
          <div className="absolute inset-0">
            <img
              src="/bg-isotipo.png"
              alt=""
              className="absolute w-[250%] h-auto opacity-50 top-[70%] left-[50%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          {/* Contenido principal */}
          <div className="relative z-20 flex flex-col h-full">
            {/* Logo en la parte superior */}
            <div className="pt-6">
              <img src="/logo.svg" className="w-[310px] h-[auto]" alt="DBT Panel" />
            </div>

            {/* Texto principal con posicionamiento específico */}
            <div className="flex-1 flex flex-col justify-end pb-5">
              <div className="max-w-[700px]">
                <h1 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] mb-4">
                  Tu aplicación de administración de deudas
                </h1>
                <p className="text-lg leading-0.5">
                  que te permite gestionar tus deudas de manera fácil y rápida.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="lg:p-8 w-full px-4">
          <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center lg:hidden">
              <img src="/logo.svg" className="mx-auto h-12 w-auto" alt="DBT Panel" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
