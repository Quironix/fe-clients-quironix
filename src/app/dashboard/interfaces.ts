export interface TopNavItem {
  title: string;
  href: string;
  isActive: boolean;
  disabled: boolean;
}

export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string;
    href: string;
    isActive: boolean;
    disabled?: boolean;
  }[];
}
