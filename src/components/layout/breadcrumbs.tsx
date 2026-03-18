/**
 * Breadcrumbs - Dynamic breadcrumb navigation
 * Author: Ahmed Adel Bakr Alderai
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

interface Breadcrumb {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useI18n();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): Breadcrumb[] => {
    const segments = pathname
      .split("/")
      .filter((segment) => segment && segment !== "dashboard");

    const breadcrumbs: Breadcrumb[] = [
      {
        label: t("nav.dashboard"),
        href: "/dashboard",
      },
    ];

    let currentPath = "/dashboard";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = t(`nav.${segment}`) || segment.replace(/-/g, " ");
      breadcrumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex items-center gap-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-sm font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
