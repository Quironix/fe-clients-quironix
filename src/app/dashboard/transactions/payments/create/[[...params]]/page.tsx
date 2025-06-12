"use client";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import Language from "@/components/ui/language";
import { FileStack } from "lucide-react";
import FormPayments from "../../components/form-payments";

const pageCreatePayments = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Ingreso pago"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileStack color="white" />}
          subDescription="Transacciones"
        />

        <div className="mt-5 p-3 border rounded-md bg-white">
          <FormPayments />
        </div>
      </Main>
    </>
  );
};

export default pageCreatePayments;
