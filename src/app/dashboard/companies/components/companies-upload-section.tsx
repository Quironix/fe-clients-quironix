"use client";

import { useProfileContext } from "@/context/ProfileContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import BulkData from "../../components/bulk-data";
import CreateManual from "../../components/create-manual";
import { bulkData } from "../services";
import { useCompaniesStore } from "../store";
import { BulkUploadResponse } from "../types";

const CompaniesUploadSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session, profile } = useProfileContext();
  const { setBulkUploadErrors, getCompanies } = useCompaniesStore();
  const router = useRouter();
  const t = useTranslations("companies");
  const tUpload = useTranslations("companies.upload");
  const tCommon = useTranslations("common.upload");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".xlsx")
    ) {
      toast.error(tCommon("selectValidFile"));
      return;
    }

    if (!session?.token || !profile?.client?.id) {
      toast.error(tCommon("authError"));
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const response: BulkUploadResponse = await bulkData(
        session.token,
        profile.client.id,
        file
      );

      setUploadResult(response);

      if (response.invalidCount === 0) {
        toast.success(tUpload("successBulk", { count: response.validCount }));
        await getCompanies(session.token, profile.client.id);
      } else {
        setBulkUploadErrors(response);
        toast.warning(tUpload("warningBulk", { valid: response.validCount, invalid: response.invalidCount }));
        router.push("/dashboard/companies/incomplete");
      }
    } catch (error: any) {
      console.error("Error al cargar archivo:", error);
      toast.error(
        JSON.parse(error.message).message ||
          tUpload("errorBulk")
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
      <div className="w-1/2 h-full">
        <CreateManual
          title={
            t.rich("upload.manualTitle", {
              company: (chunks) => <span className="text-orange-500">{chunks}</span>,
              manual: (chunks) => <span className="text-orange-500">{chunks}</span>,
            })
          }
          description={t("createDescription")}
          buttonText={t("createButton")}
          buttonLink="/dashboard/companies/create"
        />
      </div>
      <div className="w-1/2 h-full">
        <BulkData
          title={
            t.rich("upload.bulkTitle", {
              companies: (chunks) => <span className="text-orange-500">{chunks}</span>,
            })
          }
          urlFile={`${process.env.NEXT_PUBLIC_URL_FILE_COMPANIES}`}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
          handleUploadClick={handleUploadClick}
          uploadResult={uploadResult}
          downloadText={tUpload("downloadTemplate")}
          uploadText={tUpload("uploadFile")}
          uploadingText={tUpload("uploading")}
          instructionText={
            t.rich("upload.bulkInstruction", {
              uploadFile: (chunks) => <b>{chunks}</b>,
            })
          }
        />
      </div>
    </div>
  );
};

export default CompaniesUploadSection;
