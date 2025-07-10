import { toast } from "sonner";
import { create as createStore } from "zustand";
import { create, getAll, remove, update } from "../services";
import { BankInformation, BankInformationRequest } from "../services/types";

interface BankInformationStore {
  banksInformations: BankInformation[];
  setBanksInformations: (banksInformations: BankInformation[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isCreateDialogLoading: boolean;
  setIsCreateDialogLoading: (isCreateDialogLoading: boolean) => void;
  editBankInformation: BankInformation | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setEditBankInformation: (editBankInformation: BankInformation | null) => void;
  getAllBanksInformations: (
    accessToken: string,
    clientId: string
  ) => Promise<void>;

  deleteBankInformation: (
    accessToken: string,
    bankInfoId: string,
    clientId: string
  ) => Promise<void>;
  createBankInformation: (
    accessToken: string,
    bankInfo: BankInformationRequest,
    clientId: string
  ) => Promise<void>;
  updateBankInformation: (
    accessToken: string,
    bankInfoId: string,
    bankInfo: BankInformationRequest,
    clientId: string
  ) => Promise<void>;
}

export const useBankInformationStore = createStore<BankInformationStore>(
  (set, get) => ({
    banksInformations: [],
    isLoading: true,
    editBankInformation: null,
    searchTerm: "",
    isCreateDialogLoading: false,
    setIsCreateDialogLoading: (isCreateDialogLoading: boolean) =>
      set({ isCreateDialogLoading }),
    setBanksInformations: (banksInformations: BankInformation[]) =>
      set({ banksInformations }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setEditBankInformation: (editBankInformation: BankInformation | null) =>
      set({ editBankInformation }),
    setSearchTerm: (term: string) => set({ searchTerm: term }),
    getAllBanksInformations: async (accessToken: string, clientId: string) => {
      try {
        set({ isLoading: true, banksInformations: [] });
        const banksInformations = await getAll(accessToken, clientId);
        set({ banksInformations, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        toast.error("Error", {
          description:
            "No se pudo cargar la lista de cuentas bancarias. Por favor, intente nuevamente.",
        });
      }
    },

    deleteBankInformation: async (
      accessToken: string,
      bankInfoId: string,
      clientId: string
    ) => {
      try {
        set({ isLoading: true });
        await remove(accessToken, bankInfoId, clientId);
        set({ isLoading: false });
        toast.success("Cuenta bancaria eliminada exitosamente");
      } catch (error) {
        set({ isLoading: false });
        toast.error("Error", {
          description:
            "No se pudo eliminar la cuenta bancaria. Por favor, intente nuevamente.",
        });
      } finally {
        get().getAllBanksInformations(accessToken, clientId);
      }
    },
    createBankInformation: async (
      accessToken: string,
      bankInfo: BankInformationRequest,
      clientId: string
    ) => {
      try {
        set({ isCreateDialogLoading: true });
        const newBankInformation = await create(
          accessToken,
          bankInfo,
          clientId
        );
        set((state) => ({
          banksInformations: [...state.banksInformations, newBankInformation],
        }));
        set({ isCreateDialogLoading: false });
        toast.success("Cuenta bancaria creada exitosamente");
      } catch (error) {
        set({ isCreateDialogLoading: false });
        toast.error("Error", {
          description:
            "No se pudo crear la cuenta bancaria. Por favor, intente nuevamente.",
        });
      }
    },
    updateBankInformation: async (
      accessToken: string,
      bankInfoId: string,
      bankInfo: BankInformationRequest,
      clientId: string
    ) => {
      try {
        set({ isCreateDialogLoading: true });
        await update(accessToken, bankInfoId, bankInfo, clientId);

        set({ isCreateDialogLoading: false, editBankInformation: null });
        get().getAllBanksInformations(accessToken, clientId);
        toast.success("Cuenta bancaria actualizada exitosamente");
      } catch (error) {
        set({ isCreateDialogLoading: false });
        toast.error("Error", {
          description:
            "No se pudo actualizar la cuenta bancaria. Por favor, intente nuevamente.",
        });
      }
    },
  })
);
