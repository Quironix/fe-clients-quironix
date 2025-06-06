"use client";
import React, { useState } from "react";
import Image from "next/image";

import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";
import { Globe } from "lucide-react";

const Language = () => {
  const [language, setLanguage] = useState("es");
  return (
    <div className="w-full">
      <div className="flex justify-end items-center gap-2">
        <Image
          src="/img/logo-quironix.svg"
          alt="logo"
          width={100}
          height={100}
        />
        <div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{language === "es" ? "ES" : "EN"}</span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="es">ES</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Language;
