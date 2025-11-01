'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  HeartPulse,
  FileText,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: ReceiptText,
  },
  {
    href: '/optimizer',
    label: 'Optimizer',
    icon: Sparkles,
  },
  {
    href: '/health',
    label: 'Health',
    icon: HeartPulse,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="font-medium"
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
