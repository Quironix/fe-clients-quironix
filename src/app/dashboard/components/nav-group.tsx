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

// Type guards para NavLink y NavCollapsible
const isNavLink = (item: NavItem): item is NavLink => {
  return "url" in item && !("items" in item);
};

const isNavCollapsible = (item: NavItem): item is NavCollapsible => {
  return "items" in item && !("url" in item);
};

// Función para validar si el usuario tiene acceso a un item basándose en sus scopes
const hasAccessToItem = (itemScope: string, userScopes: string[]): boolean => {
  if (!itemScope || !userScopes || userScopes.length === 0) {
    return false;
  }

  return userScopes.some((userScope) => {
    const baseScopeUser = userScope.split(":")[0];
    return (
      baseScopeUser === itemScope || baseScopeUser.startsWith(itemScope + ".")
    );
  });
};

// Componente skeleton para simular la estructura del menú
const NavGroupSkeleton = ({ title }: { title: string }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {Array.from({ length: 4 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className="cursor-default pointer-events-none">
              <Skeleton className="h-4 w-4 bg-white/20" />
              <Skeleton className="h-4 w-20 bg-white/20" />
            </SidebarMenuButton>
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

export function NavGroup({ title, items, isBottom }: NavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { profile, isLoading } = useProfileContext();

  if (isLoading || !profile) {
    return <NavGroupSkeleton title={title} />;
  }

  const userScopes =
    profile?.roles?.flatMap((role: any) => role.scopes || []) || [];

  const filteredItems: NavItem[] = items
    .map((item): NavItem | null => {
      if (item.disabled) return item;

      if (!item.scope) return item;

      if (item.items) {
        const filteredSubItems = item.items.filter((subItem) => {
          if (subItem.disabled) return true;
          if (!subItem.scope) return true;
          return hasAccessToItem(subItem.scope, userScopes);
        });

        if (filteredSubItems.length === 0) return null;

        return {
          ...item,
          items: filteredSubItems,
        } as NavCollapsible;
      }

      const hasParentAccess = hasAccessToItem(item.scope, userScopes);
      if (!hasParentAccess) return null;

      return item;
    })
    .filter((item): item is NavItem => item !== null);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const key = `${item.title}-${item.url || "collapsible"}`;

          if (isNavLink(item))
            return <SidebarMenuLink key={key} item={item} href={pathname} />;

          if (state === "collapsed" && isNavCollapsible(item))
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                href={pathname}
              />
            );

          if (isNavCollapsible(item))
            return (
              <SidebarMenuCollapsible key={key} item={item} href={pathname} />
            );

          return null;
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

  if (item.disabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          className="text-white/40 cursor-not-allowed pointer-events-none"
        >
          {item.icon && <item.icon />}
          <span className="text-white/40">{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

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
                {subItem.disabled ? (
                  <SidebarMenuSubButton className="text-white/40 cursor-not-allowed pointer-events-none">
                    {subItem.icon && <subItem.icon />}
                    <span className="text-white/40">{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </SidebarMenuSubButton>
                ) : (
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
                )}
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
          {item.items.map((sub) =>
            sub.disabled ? (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                disabled
                className="opacity-40 cursor-not-allowed"
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ml-auto text-xs">{sub.badge}</span>
                )}
              </DropdownMenuItem>
            ) : (
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
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split("/")[1] !== "" &&
      href.split("/")[1] === item?.url?.split("/")[1])
  );
}
