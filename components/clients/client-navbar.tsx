"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "general-info", label: "General" },
  { id: "contracts", label: "Contracts" },
  { id: "invoices", label: "Invoices" },
  { id: "deal-info", label: "Deal" },
];

interface ClientNavbarProps {
  className?: string;
}

export function ClientNavbar({ className }: ClientNavbarProps) {
  const [activeSection, setActiveSection] = useState<string>("general-info");

  // Find the scrollable container (the one with overflow-y-auto in layout)
  const getScrollContainer = (): HTMLElement | null => {
    const inset = document.querySelector('[data-slot="sidebar-inset"]');
    if (!inset) {
      return null;
    }

    const scrollableDiv = inset.querySelector(
      'div[class*="overflow-y-auto"]'
    ) as HTMLElement;
    return scrollableDiv || null;
  };

  useEffect(() => {
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const headerOffset = 200; // Height of sticky header + navbar
      const viewportTop = scrollTop + headerOffset;

      // Find which section is currently visible at the top
      let activeId = SECTIONS[0].id;
      let maxTop = Number.NEGATIVE_INFINITY;

      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (!element) {
          continue;
        }

        // Get element's position relative to scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const elementTop = scrollTop + (elementRect.top - containerRect.top);

        // If this section is above the viewport top and is the highest one we've seen
        if (elementTop <= viewportTop && elementTop > maxTop) {
          maxTop = elementTop;
          activeId = section.id;
        }
      }

      setActiveSection(activeId);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check after a brief delay to ensure DOM is ready
    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [getScrollContainer]);

  const scrollToSection = (sectionId: string) => {
    const scrollContainer = getScrollContainer();
    const element = document.getElementById(sectionId);

    if (element && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = 150; // Offset for sticky header + navbar
      const scrollPosition =
        scrollContainer.scrollTop +
        (elementRect.top - containerRect.top) -
        offset;

      scrollContainer.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center gap-2 px-4">
        {SECTIONS.map((section) => (
          <Button
            className={cn(
              "transition-colors",
              activeSection === section.id && "bg-secondary"
            )}
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            size="sm"
            variant={activeSection === section.id ? "secondary" : "ghost"}
          >
            {section.label}
          </Button>
        ))}
      </div>
    </nav>
  );
}
