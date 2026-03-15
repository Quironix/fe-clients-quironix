import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../services", () => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteUser: vi.fn(),
  reinviteUser: vi.fn(),
  getRoles: vi.fn(),
}));

import { useUserStore } from "../index";
import * as services from "../../services";

describe("useUserStore", () => {
  beforeEach(() => {
    useUserStore.setState({
      users: [],
      loading: true,
      error: null,
      searchTerm: "",
    });
    vi.clearAllMocks();
  });

  it("should have correct initial state", () => {
    const state = useUserStore.getState();
    expect(state.users).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.searchTerm).toBe("");
  });

  it("should update searchTerm", () => {
    useUserStore.getState().setSearchTerm("john");
    expect(useUserStore.getState().searchTerm).toBe("john");
  });

  describe("fetchUsers", () => {
    it("should set users on successful array response", async () => {
      const mockUsers = [
        {
          id: "1",
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          phone_number: "+56912345678",
          type: "admin",
          roles: ["admin"],
        },
      ];
      vi.mocked(services.getAll).mockResolvedValue(mockUsers);

      await useUserStore.getState().fetchUsers("token", "client-1");

      expect(useUserStore.getState().users).toEqual(mockUsers);
      expect(useUserStore.getState().loading).toBe(false);
      expect(useUserStore.getState().error).toBeNull();
    });

    it("should extract users from { data: [...] } response", async () => {
      const mockUsers = [
        {
          id: "1",
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          phone_number: "+56912345678",
          type: "admin",
          roles: ["admin"],
        },
      ];
      vi.mocked(services.getAll).mockResolvedValue({ data: mockUsers });

      await useUserStore.getState().fetchUsers("token", "client-1");

      expect(useUserStore.getState().users).toEqual(mockUsers);
    });

    it("should extract users from { users: [...] } response", async () => {
      const mockUsers = [
        {
          id: "1",
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          phone_number: "+56912345678",
          type: "admin",
          roles: ["admin"],
        },
      ];
      vi.mocked(services.getAll).mockResolvedValue({ users: mockUsers });

      await useUserStore.getState().fetchUsers("token", "client-1");

      expect(useUserStore.getState().users).toEqual(mockUsers);
    });

    it("should set error on fetch failure", async () => {
      vi.mocked(services.getAll).mockRejectedValue(new Error("Network error"));

      await useUserStore.getState().fetchUsers("token", "client-1");

      expect(useUserStore.getState().users).toEqual([]);
      expect(useUserStore.getState().error).toBe("Error al obtener usuarios");
      expect(useUserStore.getState().loading).toBe(false);
    });
  });
});
