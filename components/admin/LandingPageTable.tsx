"use client";

import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Eye,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

// Types for landing page sections
interface LandingPageSection {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  type: "banner" | "console" | "games" | "pricelist" | "room" | "review";
}

export function LandingPageTable() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSectionType, setActiveSectionType] = useState<string>("banner");
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Sample data for sections (in a real app, this would come from an API)
  const [sections, setSections] = useState<LandingPageSection[]>([
    {
      id: "1",
      title: "Main Hero Banner",
      imageUrl: "/images/hero-banner.jpg",
      isActive: true,
      order: 1,
      type: "banner",
    },
    {
      id: "2",
      title: "PlayStation 5",
      description: "This is a PlayStation 5 with 2 joy-stick and 5 games free",
      isActive: true,
      order: 1,
      type: "console",
    },
    {
      id: "3",
      title: "PlayStation 4",
      description: "This is a PlayStation 4 with 1 joy-stick and 3 games free",
      isActive: false,
      order: 2,
      type: "console",
    },
    {
      id: "4",
      title: "FIFA 24",
      description: "Available for PS4, PS5, Console X, Nintendo Switch",
      isActive: true,
      order: 1,
      type: "games",
    },
    {
      id: "5",
      title: "Regular",
      isActive: true,
      order: 1,
      type: "pricelist",
    },
    {
      id: "6",
      title: "VIP",
      isActive: true,
      order: 2,
      type: "pricelist",
    },
    {
      id: "7",
      title: "Family VIP Room",
      description: "Perfect for family gatherings",
      imageUrl: "/images/room1.jpg",
      isActive: true,
      order: 1,
      type: "room",
    },
    {
      id: "8",
      title: "Customer Review 1",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean a aliquet neque.",
      isActive: true,
      order: 1,
      type: "review",
    },
  ]);

  // Filter sections by type and search term
  const filteredSections = sections.filter(
    (section) =>
      section.type === activeSectionType &&
      (searchTerm === "" ||
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSections = filteredSections.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Toggle section active status
  const toggleSectionStatus = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, isActive: !section.isActive }
          : section
      )
    );
  };

  // Delete section
  const deleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setSections((prev) => prev.filter((section) => section.id !== id));
    }
  };

  // Pagination controls
  const paginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          className={`h-8 w-8 ${
            currentPage === i ? "bg-amber-500 hover:bg-amber-600" : ""
          }`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  // Section type tabs
  const sectionTypes = [
    { value: "banner", label: "List Banner" },
    { value: "console", label: "List Consoles" },
    { value: "games", label: "List Games" },
    { value: "pricelist", label: "List Pricelist" },
    { value: "room", label: "List Rooms" },
    { value: "review", label: "List Customer Review" },
  ];

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-white py-4 px-6 border-b">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Landing Page Management
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select
              value={activeSectionType}
              onValueChange={(value) => {
                setActiveSectionType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full md:w-[180px]">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sectionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 pr-4 h-9 w-full md:w-[200px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button className="bg-[#B99733] hover:bg-amber-600 text-white h-9">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        {/* Section type tabs */}
        <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto">
          {sectionTypes.map((type) => (
            <Button
              key={type.value}
              variant={activeSectionType === type.value ? "default" : "outline"}
              className={`rounded-full text-sm px-4 py-1 h-8 ${
                activeSectionType === type.value
                  ? "bg-[#B99733] hover:bg-amber-600 text-white"
                  : "hover:bg-amber-50"
              }`}
              onClick={() => {
                setActiveSectionType(type.value);
                setCurrentPage(1);
              }}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                {activeSectionType !== "pricelist" && (
                  <TableHead>Title</TableHead>
                )}
                {(activeSectionType === "console" ||
                  activeSectionType === "games" ||
                  activeSectionType === "review") && (
                  <TableHead>Description</TableHead>
                )}
                {(activeSectionType === "banner" ||
                  activeSectionType === "room") && <TableHead>Image</TableHead>}
                <TableHead className="w-24 text-center">Active</TableHead>
                <TableHead className="w-20 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedSections.length > 0 ? (
                paginatedSections.map((section, index) => (
                  <TableRow key={section.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    {activeSectionType !== "pricelist" && (
                      <TableCell className="font-medium">
                        {section.title}
                      </TableCell>
                    )}
                    {(activeSectionType === "console" ||
                      activeSectionType === "games" ||
                      activeSectionType === "review") && (
                      <TableCell>{section.description || "-"}</TableCell>
                    )}
                    {(activeSectionType === "banner" ||
                      activeSectionType === "room") && (
                      <TableCell>
                        {section.imageUrl ? (
                          <div className="relative h-12 w-20 rounded overflow-hidden">
                            <Image
                              src={section.imageUrl}
                              alt={section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Switch
                        checked={section.isActive}
                        onCheckedChange={() => toggleSectionStatus(section.id)}
                        className="data-[state=checked]:bg-amber-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      activeSectionType === "pricelist"
                        ? 3
                        : activeSectionType === "banner" ||
                          activeSectionType === "room"
                        ? 4
                        : 5
                    }
                    className="text-center py-10 text-gray-500"
                  >
                    No {activeSectionType} items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {filteredSections.length > 0
              ? `${Math.min(
                  filteredSections.length,
                  startIndex + 1
                )}-${Math.min(
                  filteredSections.length,
                  startIndex + itemsPerPage
                )} of ${filteredSections.length}`
              : "0-0 of 0"}{" "}
            entries
          </span>

          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">{paginationButtons()}</div>
        )}
      </CardFooter>
    </Card>
  );
}
