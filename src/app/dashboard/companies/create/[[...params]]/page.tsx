"use client";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FormCompanies from "../../components/form-companies";
import { useCompaniesStore } from "../../store";
import { Company } from "../../types";

const page = () => {
  const { session, profile } = useProfileContext();
  const { createCompany, updateCompany, loading, error } = useCompaniesStore();
  const router = useRouter();
  const handleSubmit = async (data: Company) => {
    if (data.id) {
      const companyId = data.id;
      delete data.id;
      await updateCompany(session?.token, profile?.client?.id, companyId, data);
    } else {
      await createCompany(session?.token, profile?.client?.id, data);
    }

    if (error) {
      toast.error(error);
    } else {
      toast.success("Empresa guardada correctamente");
      router.push("/dashboard/companies");
    }
  };
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Compañías"
          description="Configura las compañías que deseas gestionar en la plataforma."
          icon={<Users color="white" />}
          subDescription="Onboarding"
        />

        <div className="mt-5 border border-gray-200 rounded-md px-8 py-5 bg-white">
          <FormCompanies onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </Main>
    </>
  );
};

export default page;
