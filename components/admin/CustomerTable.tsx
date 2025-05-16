"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Search,
  Trash,
  UserPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  GetUsersParams,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/api";

interface Customer {
  id: number | string;
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  totalSpending: number;
  status: "active" | "inactive";
  registrationDate: string;
}

interface NewCustomer {
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  status: "active" | "inactive";
}

// Konversi data User dari API menjadi format Customer
const convertApiUserToCustomer = (user: User): Customer => {
  return {
    id: user.id,
    fullName: user.name || "Unknown",
    username: user.username || "user" + user.id,
    phoneNumber: user.phone || "-",
    email: user.email || "-",
    totalSpending: user.total_spend
      ? parseFloat(user.total_spend.replace(/[^0-9]/g, ""))
      : 0,
    status: "active",
    registrationDate: user.created_at
      ? user.created_at.split("T")[0]
      : new Date().toISOString().split("T")[0],
  };
};

// Format currency
const formatCurrency = (amount: number) => {
  return `Rp${amount.toLocaleString("id-ID")}`;
};

// Component for status badge
const StatusBadge = ({ status }: { status: string }) => {
  return status === "active" ? (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
      Active
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="bg-gray-200 text-gray-800 hover:bg-gray-200"
    >
      Inactive
    </Badge>
  );
};

export function CustomerTable() {
  // State untuk data dan filter
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Customer>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    fullName: "",
    username: "",
    phoneNumber: "",
    email: "",
    status: "active",
  });

  // Set mounted to true once component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch customers data from API
  useEffect(() => {
    // Skip API request during server-side rendering or before mounting
    if (!mounted) {
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching customers data...");

        const params: GetUsersParams = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          role: "CUST", // Filter hanya untuk customer
          sortBy: mapSortFieldToApi(sortField),
          sortDirection: sortDirection,
        };

        console.log("API request parameters:", params);

        const response = await getUsers(params);
        console.log("API response:", response);

        if (response && Array.isArray(response.users)) {
          const formattedCustomers = response.users
            .filter((user) => user.role === "CUST")
            .map(convertApiUserToCustomer);
          console.log("Processed customers:", formattedCustomers);

          setCustomers(formattedCustomers);
          setTotalCustomers(formattedCustomers.length);
          setTotalPages(
            response.totalPages ||
              Math.ceil(formattedCustomers.length / itemsPerPage)
          );
        } else {
          console.error("Invalid API response format:", response);
          throw new Error("API returned an invalid data format");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(
          `Failed to load customers: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        toast.error("Failed to load customers. Please try again.");

        // Jika terjadi error, tetapkan data kosong
        setCustomers([]);
        setTotalCustomers(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    mounted,
    refreshTrigger,
  ]);

  // Map sort field dari Customer ke field API
  const mapSortFieldToApi = (field: keyof Customer): string => {
    const fieldMap: Record<string, string> = {
      fullName: "name",
      email: "email",
      totalSpending: "total_spend",
      registrationDate: "created_at",
      // tambahkan mapping lain jika diperlukan
    };

    return fieldMap[field] || field.toString();
  };

  // Get top 3 customers
  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 3);

  // Filter data (untuk pencarian lokal jika API tidak mendukung pencarian)
  const filteredData =
    searchTerm && !loading && customers.length > 0
      ? customers.filter((customer) => {
          return (
            customer.fullName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (customer.username &&
              customer.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
          );
        })
      : customers;

  // Jika API sudah menangani pagination, gunakan data yang sudah ada
  const paginatedData = filteredData;

  // Handle sorting - akan memicu API call melalui useEffect
  const handleSort = (field: keyof Customer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination buttons
  const paginationButtons = () => {
    const buttons = [];

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1 || loading}
        className="h-8 w-8 p-0 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page numbers - Limit to maximum 5 buttons
    const maxButtons = 5;
    const startPage = Math.max(
      1,
      Math.min(
        currentPage - Math.floor(maxButtons / 2),
        totalPages - maxButtons + 1
      )
    );
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(1)}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === 1 ? "bg-[#B99733] text-white" : ""
          }`}
        >
          1
        </Button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === i ? "bg-[#B99733] text-white" : ""
          }`}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="mx-1">
            ...
          </span>
        );
      }

      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          className={`h-8 w-8 p-0 rounded-full ${
            currentPage === totalPages ? "bg-[#B99733] text-white" : ""
          }`}
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages || totalPages === 0 || loading}
        className="h-8 w-8 p-0 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  // Handle customer actions
  const handleAddCustomer = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      fullName: customer.fullName,
      username: customer.username,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      status: customer.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  // Save functions
  const saveNewCustomer = () => {
    // Validate fields
    if (
      !newCustomer.fullName ||
      !newCustomer.email ||
      !newCustomer.phoneNumber ||
      !newCustomer.username
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    // Phone validation - simple numeric check with min length
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(newCustomer.phoneNumber.replace(/[-\s]/g, ""))) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    // Set loading state
    setLoading(true);

    // Create user data object for API
    const userData = {
      name: newCustomer.fullName,
      email: newCustomer.email,
      username: newCustomer.username,
      phone: newCustomer.phoneNumber,
      role: "CUST",
      // Generate a random password that will be changed by the user
      password: Math.random().toString(36).substring(2, 10) + "Aa1!",
    };

    // Call API to create customer
    createUser(userData)
      .then(() => {
        toast.success("Customer added successfully!");
        setIsAddModalOpen(false);

        // Reset form
        setNewCustomer({
          fullName: "",
          username: "",
          phoneNumber: "",
          email: "",
          status: "active",
        });

        // Refresh data
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Error creating customer:", error);
        toast.error(
          `Failed to add customer: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveEditedCustomer = () => {
    // Validate fields
    if (
      !newCustomer.fullName ||
      !newCustomer.email ||
      !newCustomer.phoneNumber ||
      !newCustomer.username
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    // Phone validation - simple numeric check with min length
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(newCustomer.phoneNumber.replace(/[-\s]/g, ""))) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    if (!selectedCustomer) return;

    // Set loading state
    setLoading(true);

    // Create user data object for API
    const userData = {
      name: newCustomer.fullName,
      email: newCustomer.email,
      phone: newCustomer.phoneNumber,
      // Don't update password here - should be a separate function
    };

    // Call API to update customer
    updateUser(selectedCustomer.id.toString(), userData)
      .then(() => {
        toast.success("Customer updated successfully!");
        setIsEditModalOpen(false);
        setSelectedCustomer(null);

        // Refresh current page
        setRefreshTrigger((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Error updating customer:", error);
        toast.error(
          `Failed to update customer: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteCustomer = () => {
    if (!selectedCustomer) return;

    // Set loading state
    setLoading(true);

    // Call API to delete customer
    deleteUser(selectedCustomer.id.toString())
      .then(() => {
        toast.success("Customer deleted successfully!");
        setIsDeleteModalOpen(false);
        setSelectedCustomer(null);

        // Refresh current page
        setRefreshTrigger((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Error deleting customer:", error);
        toast.error(
          `Failed to delete customer: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Top Users Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top User</h2>
        {loading ? (
          <div className="flex justify-center items-center h-28">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : topCustomers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center space-x-3"
              >
                <div className="w-10 h-10 flex items-center justify-center font-bold rounded-full bg-[#B99733] text-white">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">
                    {customer.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">{customer.username}</p>
                  <p className="text-xs font-medium text-amber-600">
                    {formatCurrency(customer.totalSpending)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">No customer data available</p>
          </div>
        )}
      </div>

      {/* Customer Table Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">User List</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            <Button
              onClick={() => {
                setLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              variant="outline"
              className="h-10 px-3"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>

            <Button
              onClick={handleAddCustomer}
              className="bg-[#B99733] text-white h-10 hover:bg-amber-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
            {/* Entries selector */}
            <div className="flex items-center space-x-2">
              <Label>Show</Label>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label>entries</Label>
            </div>

            {/* Filter and search section */}
            <div className="flex items-center gap-3">
              {/* No buttons needed here since we have them in the header */}
            </div>
          </div>

          {error && (
            <div className="m-4 p-3 border border-red-500 bg-red-50 rounded text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[50px] uppercase font-semibold">
                    NO
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center">
                      NAME
                      {sortField === "fullName" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center">
                      USERNAME
                      {sortField === "username" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("phoneNumber")}
                  >
                    <div className="flex items-center">
                      PHONE NUMBER
                      {sortField === "phoneNumber" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      EMAIL
                      {sortField === "email" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("totalSpending")}
                  >
                    <div className="flex items-center">
                      TOTAL SPENDING
                      {sortField === "totalSpending" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 uppercase font-semibold"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      STATUS
                      {sortField === "status" && (
                        <ArrowUpDown
                          className={`ml-1 h-3 w-3 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="uppercase font-semibold text-right">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
                        <span>Loading customers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((customer, index) => (
                    <TableRow
                      key={customer.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.fullName}
                      </TableCell>
                      <TableCell>{customer.username}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.totalSpending)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={customer.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-amber-500 text-amber-500 hover:bg-amber-50"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Showing{" "}
                  {paginatedData.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}{" "}
                  to {Math.min(currentPage * itemsPerPage, totalCustomers)} of{" "}
                  {totalCustomers} entries
                </>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                {paginationButtons()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer account for MGE Rental
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter customer name"
                value={newCustomer.fullName}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    fullName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newCustomer.username}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    username: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter customer email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="Enter customer phone number"
                value={newCustomer.phoneNumber}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    phoneNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newCustomer.status}
                onValueChange={(value: "active" | "inactive") =>
                  setNewCustomer({
                    ...newCustomer,
                    status: value,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select customer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNewCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Enter customer name"
                  value={newCustomer.fullName}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-username"
                  placeholder="Enter username"
                  value={newCustomer.username}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      username: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter customer email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-phone"
                  placeholder="Enter customer phone number"
                  value={newCustomer.phoneNumber}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={newCustomer.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setNewCustomer({
                      ...newCustomer,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select customer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveEditedCustomer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Customer Modal */}
      {selectedCustomer && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedCustomer.fullName}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteCustomer}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
