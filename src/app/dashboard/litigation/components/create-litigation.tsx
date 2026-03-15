"use client";
import { Button } from "@/components/ui/button";

import { FileBadge } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DialogForm from "../../components/dialog-form";
import { usePaymentNettingStore } from "../../payment-netting/store";
import DisputeForm from "./dispute-form";

interface CreateLitigationProps {
  onRefetch?: () => void;
  onlyButton?: boolean;
}

const CreateLitigation = ({
  onRefetch,
  onlyButton = false,
}: CreateLitigationProps) => {
  const t = useTranslations("litigation.create");
  const [open, setOpen] = useState(false);
  const { selectedInvoices, totalInvoices, totalPayments } =
    usePaymentNettingStore();
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  useEffect(() => {
    if (selectedInvoices.length > 0) {
      setLastInvoice(selectedInvoices[selectedInvoices.length - 1]);
    }
  }, [selectedInvoices, totalInvoices, totalPayments]);
  return (
    <>
      {onlyButton ? (
        <DialogForm
          trigger={
            <Button
              className="border border-orange-400 text-black bg-white hover:bg-orange-100"
              onClick={() => setOpen(true)}
            >
              <FileBadge className="w-4 h-4 text-orange-400" />
              {t("enterLitigation")}
            </Button>
          }
          title={t("entryTitle")}
          description={t("entryDescription")}
          open={open}
          onOpenChange={setOpen}
        >
          <DisputeForm
            handleClose={() => setOpen(false)}
            onRefetch={onRefetch}
            dataToAdd={lastInvoice}
          />
        </DialogForm>
      ) : (
        <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
          <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
            <span className="text-orange-500">{t("createTitle")}</span> {t("sectionTitle")}
          </h2>
          <div className="flex flex-col items-center justify-center w-full">
            <span className="text-sm text-gray-500 mb-5">
              {t("sectionDescription")}
            </span>
            <DialogForm
              trigger={
                <Button
                  className="bg-blue-700 text-white w-64"
                  onClick={() => setOpen(true)}
                >
                  {t("createButton")}
                </Button>
              }
              title={t("entryTitle")}
              description={t("entryDescription")}
              open={open}
              onOpenChange={setOpen}
            >
              <DisputeForm
                handleClose={() => setOpen(false)}
                onRefetch={onRefetch}
              />
            </DialogForm>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateLitigation;
