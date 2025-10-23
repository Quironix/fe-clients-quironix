"use client";
import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { Cog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";

const CollectorsContent = () => {
  const router = useRouter();

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Collectors"
          description="Aquí puedes ver un resumen de collectors."
          icon={<Cog color="white" />}
          subDescription="Collectors"
        />

        <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
          <div className="w-[25%] h-full bg-[#F1F5F9] p-5 rounded-md">
            <Image
              src="/img/collectors.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>
          <div className="w-[75%] h-full">
            <div className="flex flex-col gap-3 justify-center items-start h-full">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio
                assumenda iure necessitatibus, recusandae eaque repellat soluta
                adipisci sapiente laudantium quis quidem, aliquid distinctio,
                blanditiis qui itaque nam incidunt maxime modi.
              </p>
              <Button
                onClick={() => router.push("/dashboard/collectors/create")}
              >
                Crear collector
              </Button>
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

const CollectorsPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CollectorsContent />
    </Suspense>
  );
};

export default CollectorsPage;
