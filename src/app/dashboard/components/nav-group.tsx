"use client";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { NavCollapsible, NavItem, NavLink, type NavGroup } from "../types";

// Función para validar si el usuario tiene acceso a un item basándose en sus scopes
const hasAccessToItem = (itemScope: string, userScopes: string[]): boolean => {
  if (!itemScope || !userScopes || userScopes.length === 0) {
    return false;
  }

  // Verificar si algún scope del usuario coincide o es más específico que el scope del item
  return userScopes.some((userScope) => {
    // Remover la parte de acción (:read, :edit, :delete) del scope del usuario
    const baseScopeUser = userScope.split(":")[0];
    // El usuario tiene acceso si su scope base coincide o es más específico que el del item
    return (
      baseScopeUser === itemScope || baseScopeUser.startsWith(itemScope + ".")
    );
  });
};

// Componente skeleton para simular la estructura del menú
const NavGroupSkeleton = ({ title }: { title: string }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white font-extrabold">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {/* Skeleton para 3-4 items del menú */}
        {Array.from({ length: 4 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className="cursor-default pointer-events-none">
              <Skeleton className="h-4 w-4 bg-white/20" />
              <Skeleton className="h-4 w-20 bg-white/20" />
            </SidebarMenuButton>
            {/* Skeleton para subitems (algunos items) */}
            {index % 2 === 0 && (
              <SidebarMenuSub>
                {Array.from({ length: 2 }).map((_, subIndex) => (
                  <SidebarMenuSubItem key={subIndex}>
                    <SidebarMenuSubButton className="cursor-default pointer-events-none">
                      <Skeleton className="h-3 w-16 bg-white/15" />
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { profile, isLoading } = useProfileContext();

  // Mostrar skeleton mientras se carga el perfil
  if (isLoading || !profile) {
    return <NavGroupSkeleton title={title} />;
  }

  // Obtener todos los scopes del usuario desde sus roles
  const userScopes =
    profile?.roles?.flatMap((role: any) => role.scopes || []) || [];

  // Filtrar items basándose en los scopes del usuario
  const filteredItems = items
    .map((item) => {
      // Si el item no tiene scope definido, se muestra por defecto
      if (!item.scope) return item;

      // Verificar si el usuario tiene acceso al item padre
      const hasParentAccess = hasAccessToItem(item.scope, userScopes);

      // Si no tiene acceso al padre, retornar null
      if (!hasParentAccess) return null;

      // Si tiene items hijos, filtrar los hijos también
      if (item.items) {
        const filteredSubItems = item.items.filter((subItem) => {
          if (!subItem.scope) return true;
          return hasAccessToItem(subItem.scope, userScopes);
        });

        // Solo mostrar el item padre si tiene al menos un hijo visible
        if (filteredSubItems.length === 0) return null;

        // Crear una copia del item con los subitems filtrados
        return {
          ...item,
          items: filteredSubItems,
        };
      }

      return item;
    })
    .filter((item) => item !== null);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white font-extrabold">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={pathname} />;

          if (state === "collapsed")
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                href={pathname}
              />
            );

          return (
            <SidebarMenuCollapsible key={key} item={item} href={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
        className="text-white"
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span className="text-white">{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  const { setOpenMobile } = useSidebar();
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(href, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkIsActive(href, subItem)}
                >
                  <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <subItem.icon />}
                    <span className="text-white">{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible;
  href: string;
}) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                href={sub.url}
                className={`${checkIsActive(href, sub) ? "bg-[#2F6EFF]" : ""}`}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ml-auto text-xs">{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split("?")[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split("/")[1] !== "" &&
      href.split("/")[1] === item?.url?.split("/")[1])
  );
}
