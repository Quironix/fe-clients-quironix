import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import TitleStep from "../../settings/components/title-step";
import { VariableInput } from "./variable-input";

interface MessageContentSectionProps {
  form: UseFormReturn<any>;
}

export function MessageContentSection({ form }: MessageContentSectionProps) {
  return (
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
      <AccordionContent className="space-y-4 px-1 py-4">
        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Canal de comunicación <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EMAIL" id="email" />
                    <label htmlFor="email" className="cursor-pointer">
                      Correo electrónico
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WHATSAPP" id="whatsapp" />
                    <label htmlFor="whatsapp" className="cursor-pointer">
                      WhatsApp
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SMS" id="sms" />
                    <label htmlFor="sms" className="cursor-pointer">
                      Mensaje de texto
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Asunto <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <VariableInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Ej: Tu factura de..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cuerpo del mensaje <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Completa" rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="send_associate_invoices"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start space-x-3 space-y-0">
              <FormLabel>Adjuntar factura</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    Enviar facturas asociadas
                  </span>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
