import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Language from "@/components/ui/language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Cog, FileText, FolderTree, User } from "lucide-react";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import TitleStep from "../../settings/components/title-step";

const PageCreateCollector = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Crear collectors"
          description="Aquí puedes crear un collectors."
          icon={<Cog color="white" />}
          subDescription="Collectors"
        />
        <div className="bg-blue-50 p-5 flex justify-between items-center rounded-md mb-5">
          <div className="flex flex-col gap-0">
            <span className="font-bold">Estado inicial</span>
            <span className="-mt-1 text-sm text-gray-600">
              El collector enviará notificaciones automáticamente
            </span>
          </div>
          <div>
            <Switch defaultChecked />
          </div>
        </div>
        <Form {...form}>
          <form className="space-y-5">
            <Accordion
              type="multiple"
              defaultValue={["general-information"]} // Expandir todos por defecto]}
              className="w-full space-y-5"
            >
              {/* ISLA 1: Información general */}
              <AccordionItem
                key="general-information"
                value="general-information"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Información general"
                      icon={<User className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4">
                  <FormField
                    control={form.control}
                    name="managementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo de gestión{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Limpiar selecciones posteriores
                            form.setValue("debtorComment", "");
                            form.setValue("executiveComment", "");
                            form.setValue("caseData", {});
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tipo de gestión" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CALL_OUT">
                              Llamada saliente
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* ISLA 2: Contenido del mensaje adjunto */}
              <AccordionItem
                key="message-content"
                value="message-content"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Contenido del mensaje y adjuntos"
                      icon={<FileText className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4"></AccordionContent>
              </AccordionItem>

              {/* ISLA 3:Segmentación y lógica de envío */}
              <AccordionItem
                key="segmentation-logic"
                value="segmentation-logic"
                className="border border-gray-200 rounded-md px-4 py-2 mb-5"
              >
                <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
                  <AccordionTrigger className="flex items-center justify-between h-full">
                    <TitleStep
                      title="Segmentación y lógica de envíos"
                      icon={<FolderTree className="w-5 h-5" />}
                    />
                  </AccordionTrigger>
                </div>
                <AccordionContent className="grid grid-cols-3 gap-4 text-balance px-1 py-4"></AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </Form>
      </Main>
    </>
  );
};

export default PageCreateCollector;
