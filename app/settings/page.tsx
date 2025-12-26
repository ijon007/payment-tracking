"use client";

import { Gear, FloppyDisk, CaretDown } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES } from "@/lib/currency-utils";
import { useSettings } from "@/lib/settings-store";
import type { DateFormat, Theme } from "@/lib/settings-store";

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
  { value: "MMM dd, yyyy", label: "MMM DD, YYYY" },
  { value: "dd MMM yyyy", label: "DD MMM YYYY" },
];

export default function SettingsPage() {
  const { settings, updateCompany, setTheme, setDateFormat, setBaseCurrency } =
    useSettings();
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Local state for form inputs
  const [companyName, setCompanyName] = useState(settings.company.name);
  const [companyAddress, setCompanyAddress] = useState(
    settings.company.address
  );
  const [companyEmail, setCompanyEmail] = useState(settings.company.email);
  const [companyPhone, setCompanyPhone] = useState(settings.company.phone);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(
    settings.company.logoUrl || ""
  );
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    settings.appearance.theme
  );
  const [selectedDateFormat, setSelectedDateFormat] = useState<DateFormat>(
    settings.dateFormat
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    settings.baseCurrency
  );

  // Sync local state when settings change
  useEffect(() => {
    setCompanyName(settings.company.name);
    setCompanyAddress(settings.company.address);
    setCompanyEmail(settings.company.email);
    setCompanyPhone(settings.company.phone);
    setCompanyLogoUrl(settings.company.logoUrl || "");
    setSelectedTheme(settings.appearance.theme);
    setSelectedDateFormat(settings.dateFormat);
    setSelectedCurrency(settings.baseCurrency);
  }, [settings]);

  // Handle theme sync with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && selectedTheme !== currentTheme) {
      setNextTheme(selectedTheme);
    }
  }, [selectedTheme, mounted, currentTheme, setNextTheme]);

  const handleSave = () => {
    // Update company details
    updateCompany({
      name: companyName,
      address: companyAddress,
      email: companyEmail,
      phone: companyPhone,
      logoUrl: companyLogoUrl || undefined,
    });

    // Update theme
    setTheme(selectedTheme);
    if (mounted) {
      setNextTheme(selectedTheme);
    }

    // Update date format
    setDateFormat(selectedDateFormat);

    // Update base currency
    setBaseCurrency(selectedCurrency);

    toast.success("Settings saved successfully");
  };

  const hasChanges =
    companyName !== settings.company.name ||
    companyAddress !== settings.company.address ||
    companyEmail !== settings.company.email ||
    companyPhone !== settings.company.phone ||
    companyLogoUrl !== (settings.company.logoUrl || "") ||
    selectedTheme !== settings.appearance.theme ||
    selectedDateFormat !== settings.dateFormat ||
    selectedCurrency !== settings.baseCurrency;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              Default company information used across the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-address">Address</Label>
              <Textarea
                id="company-address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Enter company address"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="Enter company email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input
                id="company-phone"
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="Enter company phone"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-logo">Logo URL (Optional)</Label>
              <Input
                id="company-logo"
                type="url"
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <RadioGroup
                value={selectedTheme}
                onValueChange={(value) => setSelectedTheme(value as Theme)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="cursor-pointer">
                    Light
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="cursor-pointer">
                    Dark
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="cursor-pointer">
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Date Format */}
        <Card>
          <CardHeader>
            <CardTitle>Date Format</CardTitle>
            <CardDescription>
              Choose how dates are displayed throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="date-format">Format</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  id="date-format"
                  render={
                    <Button
                      className="w-full justify-between border-border"
                      variant="outline"
                    >
                      {DATE_FORMATS.find((f) => f.value === selectedDateFormat)?.label || "Select format"}
                      <CaretDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-full">
                  {DATE_FORMATS.map((format) => (
                    <DropdownMenuItem
                      key={format.value}
                      onClick={() =>
                        setSelectedDateFormat(format.value as DateFormat)
                      }
                    >
                      {format.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Base Currency */}
        <Card>
          <CardHeader>
            <CardTitle>Base Currency</CardTitle>
            <CardDescription>
              Default currency for displaying amounts in dashboards and views
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="base-currency">Currency</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  id="base-currency"
                  render={
                    <Button
                      className="w-full justify-between border-border"
                      variant="outline"
                    >
                      {CURRENCIES.find((c) => c.code === selectedCurrency)
                        ? `${CURRENCIES.find((c) => c.code === selectedCurrency)?.name} (${CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol})`
                        : "Select currency"}
                      <CaretDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-full">
                  {CURRENCIES.map((currency) => (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() =>
                        setSelectedCurrency(currency.code as "USD" | "EUR" | "GBP" | "ALL")
                      }
                    >
                      {currency.name} ({currency.symbol})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <FloppyDisk weight="fill" className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

