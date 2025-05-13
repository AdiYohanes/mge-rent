"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Search,
  Trash,
  UserPlus,
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

interface Customer {
  id: number;
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

// Dummy data untuk tabel customer
const customerData: Customer[] = [
  {
    id: 1,
    fullName: "Asep Subagja",
    username: "Sandeeps",
    phoneNumber: "081234567890",
    email: "ustil@mail.ru",
    totalSpending: 10000000,
    status: "active",
    registrationDate: "2025-01-10",
  },
  {
    id: 2,
    fullName: "Asep Subardi",
    username: "Shivam98",
    phoneNumber: "081998765432",
    email: "bertou@yandex.ru",
    totalSpending: 6000000,
    status: "active",
    registrationDate: "2025-01-15",
  },
  {
    id: 3,
    fullName: "Daniel",
    username: "LakshitKumar",
    phoneNumber: "081387654321",
    email: "irnabela@gmail.com",
    totalSpending: 1000000,
    status: "active",
    registrationDate: "2025-01-20",
  },
  {
    id: 4,
    fullName: "Cameron",
    username: "NishitK",
    phoneNumber: "085565432109",
    email: "ahana@mail.ru",
    totalSpending: 950000,
    status: "active",
    registrationDate: "2025-02-01",
  },
  {
    id: 5,
    fullName: "Colleen",
    username: "HeroCoder",
    phoneNumber: "081787654321",
    email: "redaniel@gmail.com",
    totalSpending: 900000,
    status: "active",
    registrationDate: "2025-02-10",
  },
  {
    id: 6,
    fullName: "Mitchell",
    username: "Viveka",
    phoneNumber: "081887654321",
    email: "ulfaha@mail.ru",
    totalSpending: 700000,
    status: "active",
    registrationDate: "2025-02-15",
  },
  {
    id: 7,
    fullName: "Aubrey",
    username: "CodeWithSomya",
    phoneNumber: "085765432109",
    email: "igerrin@gmail.com",
    totalSpending: 600000,
    status: "active",
    registrationDate: "2025-03-01",
  },
];

export function CustomerTable() {
  // State untuk data dan filter
  const [customers, setCustomers] = useState<Customer[]>(customerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Customer>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Get top 3 customers
  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpending - a.totalSpending)
    .slice(0, 3);

  // Filter dan sort data
  const filteredData = customers
    .filter((customer) => {
      // Text search filter
      return (
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle sorting
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
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
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

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
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

    // Create new customer (in a real app, this would be an API call)
    const newCustomerObj: Customer = {
      id: customers.length + 1,
      ...newCustomer,
      totalSpending: 0,
      registrationDate: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, newCustomerObj]);
    setIsAddModalOpen(false);
    setNewCustomer({
      fullName: "",
      username: "",
      phoneNumber: "",
      email: "",
      status: "active",
    });

    toast.success("Customer added successfully!");
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

    // Update customer (in a real app, this would be an API call)
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === selectedCustomer.id) {
        return {
          ...customer,
          fullName: newCustomer.fullName,
          username: newCustomer.username,
          phoneNumber: newCustomer.phoneNumber,
          email: newCustomer.email,
          status: newCustomer.status,
        };
      }
      return customer;
    });

    setCustomers(updatedCustomers);
    setIsEditModalOpen(false);
    setSelectedCustomer(null);

    toast.success("Customer updated successfully!");
  };

  const deleteCustomer = () => {
    if (!selectedCustomer) return;

    // Delete customer (in a real app, this would be an API call)
    const updatedCustomers = customers.filter(
      (customer) => customer.id !== selectedCustomer.id
    );

    setCustomers(updatedCustomers);
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);

    toast.success("Customer deleted successfully!");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Users Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top User</h2>
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
                <h3 className="font-bold text-gray-800">{customer.fullName}</h3>
                <p className="text-sm text-gray-500">{customer.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Table Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Customer MGE Rental
        </h2>
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
              {/* Search box */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Add customer button */}
              <Button
                className="bg-[#B99733] hover:bg-amber-700 flex gap-1 items-center cursor-pointer"
                onClick={handleAddCustomer}
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Customer</span>
              </Button>
            </div>
          </div>

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
                  <TableHead className="uppercase font-semibold text-right">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((customer, index) => (
                    <TableRow
                      key={customer.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {customer.fullName}
                      </TableCell>
                      <TableCell>{customer.username}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.totalSpending)}
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
              Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              {paginationButtons()}
            </div>
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
