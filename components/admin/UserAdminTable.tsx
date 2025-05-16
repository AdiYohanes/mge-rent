"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getUsers, deleteUser, User, GetUsersParams } from "@/api";

// Mapping API User to Admin interface
interface Admin {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  permission: "Superadmin" | "Admin";
  status: "active" | "inactive";
  registrationDate: string;
}

interface NewAdmin {
  fullName: string;
  phoneNumber: string;
  email: string;
  permission: "Superadmin" | "Admin";
  status: "active" | "inactive";
}

// Helper function to convert User from API to Admin interface
const convertUserToAdmin = (user: User): Admin => {
  if (!user) {
    // Fallback jika user undefined
    return {
      id: Math.floor(Math.random() * 1000),
      fullName: "Unknown User",
      phoneNumber: "-",
      email: "-",
      permission: "Admin",
      status: "active",
      registrationDate: new Date().toISOString().split("T")[0],
    };
  }

  return {
    id:
      typeof user.id === "number"
        ? user.id
        : parseInt(user.id as string) || Math.floor(Math.random() * 1000),
    fullName: user.name || "Unknown",
    phoneNumber: user.phone || "-",
    email: user.email || "-",
    // Map API roles to UI roles
    permission: user.role === "SADMN" ? "Superadmin" : "Admin",
    // Default status to active since API might not provide it
    status: "active",
    // Use created_at as registration date
    registrationDate:
      user.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
  };
};

export function UserAdminTable() {
  // State untuk data dan filter
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Admin>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    fullName: "",
    phoneNumber: "",
    email: "",
    permission: "Admin",
    status: "active",
  });

  // Set mounted to true once component has mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch admin users from API
  useEffect(() => {
    // Skip API request during server-side rendering to avoid hydration mismatch
    if (!mounted) {
      return;
    }

    const fetchAdminUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: GetUsersParams = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm || undefined,
          // Filter for admin roles: ADMN and SADMN (super admin)
          role: "ADMN,SADMN",
          sortBy: sortField.toString(),
          sortDirection,
        };

        console.log("Fetching admin users with params:", params);
        const responseData = await getUsers(params);
        console.log("Received admin user data:", responseData);

        // Pastikan responseData dan responseData.users ada sebelum melakukan map
        if (responseData && Array.isArray(responseData.users)) {
          // Convert API response to Admin interface and filter to only include admin roles
          const mappedAdmins = responseData.users
            .filter((user) => user.role === "ADMN" || user.role === "SADMN")
            .map(convertUserToAdmin);
          setAdmins(mappedAdmins);
          setTotalItems(mappedAdmins.length);
          setApiTotalPages(responseData.totalPages || 1);

          if (mappedAdmins.length === 0) {
            console.warn("No admin users found in the response");
          } else {
            console.log(
              `Successfully loaded ${mappedAdmins.length} admin users`
            );
          }
        } else {
          // Jika responseData.users undefined atau bukan array, tampilkan error
          const errorMsg =
            "API response missing users array or not in expected format";
          console.error(errorMsg, responseData);
          setError(errorMsg);
          toast.error("API returned invalid data format.");
          setAdmins([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error("Error fetching admin users:", err);
        setError("Failed to load admin users. Please try again later.");
        toast.error("Failed to load admin users.");
        setAdmins([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminUsers();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    sortField,
    sortDirection,
    mounted,
    refreshTrigger,
  ]);

  // Prevent hydration issues by rendering a simple version on initial load
  if (!mounted) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">
            Admin User Management
          </CardTitle>
          <CardDescription>Loading admin user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // For client-side filtering, in case we need it
  const filteredData = admins
    ? admins.filter((admin) => {
        if (!searchTerm) return true;

        return (
          admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.phoneNumber.includes(searchTerm)
        );
      })
    : [];

  // Calculate total pages - use API total pages when available
  const totalPages =
    apiTotalPages || Math.ceil((filteredData.length || 1) / itemsPerPage);

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Handle sorting - for client-side sorting or to update API params
  const handleSort = (field: keyof Admin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
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

  // Handle admin actions
  const handleAddAdmin = () => {
    setIsAddModalOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setNewAdmin({
      fullName: admin.fullName,
      phoneNumber: admin.phoneNumber,
      email: admin.email,
      permission: admin.permission,
      status: admin.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // Save functions
  const saveNewAdmin = () => {
    // Validate fields
    if (!newAdmin.fullName || !newAdmin.email || !newAdmin.phoneNumber) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdmin.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    // Phone validation - simple numeric check with min length
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(newAdmin.phoneNumber.replace(/[-\s]/g, ""))) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    // Create new admin (in a real app, this would be an API call)
    const newAdminObj: Admin = {
      id: admins.length + 1,
      ...newAdmin,
      registrationDate: new Date().toISOString().split("T")[0],
    };

    setAdmins([...admins, newAdminObj]);
    setIsAddModalOpen(false);
    setNewAdmin({
      fullName: "",
      phoneNumber: "",
      email: "",
      permission: "Admin",
      status: "active",
    });

    toast.success("Admin added successfully!");
  };

  const saveEditedAdmin = () => {
    // Validate fields
    if (!newAdmin.fullName || !newAdmin.email || !newAdmin.phoneNumber) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdmin.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    // Phone validation - simple numeric check with min length
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(newAdmin.phoneNumber.replace(/[-\s]/g, ""))) {
      toast.error("Please enter a valid phone number!");
      return;
    }

    if (!selectedAdmin) return;

    // Update admin (in a real app, this would be an API call)
    const updatedAdmins = admins.map((admin) => {
      if (admin.id === selectedAdmin.id) {
        return {
          ...admin,
          fullName: newAdmin.fullName,
          phoneNumber: newAdmin.phoneNumber,
          email: newAdmin.email,
          permission: newAdmin.permission,
          status: newAdmin.status,
        };
      }
      return admin;
    });

    setAdmins(updatedAdmins);
    setIsEditModalOpen(false);
    setSelectedAdmin(null);

    toast.success("Admin updated successfully!");
  };

  const deleteAdmin = () => {
    if (!selectedAdmin) return;

    setLoading(true);

    // Call the deleteUser API
    deleteUser(selectedAdmin.id.toString())
      .then(() => {
        // Update the local state to remove the deleted admin
        const updatedAdmins = admins.filter(
          (admin) => admin.id !== selectedAdmin.id
        );
        setAdmins(updatedAdmins);

        // Close modal and clear selection
        setIsDeleteModalOpen(false);
        setSelectedAdmin(null);

        // Show success message
        toast.success("Admin deleted successfully!");

        // Refresh data to ensure we're in sync with the backend
        setRefreshTrigger((prev) => prev + 1);
      })
      .catch((error) => {
        console.error("Error deleting admin:", error);
        toast.error(
          `Failed to delete admin: ${
            error.response?.data?.message || "Unknown error"
          }`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">
          Admin User Management
        </CardTitle>
        <CardDescription>
          Manage your admin user accounts and their access
        </CardDescription>
        <div className="flex flex-wrap items-center justify-between mt-2 gap-4">
          {/* Show entries selector */}
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
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search admin users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setRefreshTrigger((prev) => prev + 1);
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
            <Button
              className="bg-[#B99733] hover:bg-blue-700 flex gap-1 items-center"
              onClick={handleAddAdmin}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Admin</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("fullName")}
                >
                  <div className="flex items-center">
                    FULL NAME
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
                  className="cursor-pointer hover:bg-gray-50"
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
                  className="cursor-pointer hover:bg-gray-50"
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
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("permission")}
                >
                  <div className="flex items-center">
                    PERMISSION
                    {sortField === "permission" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
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
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("registrationDate")}
                >
                  <div className="flex items-center">
                    Registration Date
                    {sortField === "registrationDate" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
                      <span>Loading admin users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-red-500 mb-2">{error}</span>
                      <span className="text-sm text-gray-500">
                        Please try again later or contact support
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRefreshTrigger((prev) => prev + 1)}
                        className="mt-3"
                      >
                        Try Again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((admin, index) => (
                  <TableRow
                    key={admin.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {admin.fullName}
                    </TableCell>
                    <TableCell>{admin.phoneNumber}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.permission}</TableCell>
                    <TableCell>
                      <StatusBadge status={admin.status} />
                    </TableCell>
                    <TableCell>{formatDate(admin.registrationDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-amber-500 text-amber-500 hover:bg-amber-50"
                          onClick={() => handleEditAdmin(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteAdmin(admin)}
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
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {totalItems || 0} entries
            </>
          )}
        </div>
        <div className="space-x-1">{totalPages > 0 && paginationButtons()}</div>
      </CardFooter>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Admin User</DialogTitle>
            <DialogDescription>
              Create a new admin user with access to the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter admin name"
                value={newAdmin.fullName}
                onChange={(e) =>
                  setNewAdmin({
                    ...newAdmin,
                    fullName: e.target.value,
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
                placeholder="Enter admin phone number"
                value={newAdmin.phoneNumber}
                onChange={(e) =>
                  setNewAdmin({
                    ...newAdmin,
                    phoneNumber: e.target.value,
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
                placeholder="Enter admin email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({
                    ...newAdmin,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission">Permission</Label>
              <Select
                value={newAdmin.permission}
                onValueChange={(value: "Superadmin" | "Admin") =>
                  setNewAdmin({
                    ...newAdmin,
                    permission: value,
                  })
                }
              >
                <SelectTrigger id="permission">
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Superadmin">Superadmin</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newAdmin.status}
                onValueChange={(value: "active" | "inactive") =>
                  setNewAdmin({
                    ...newAdmin,
                    status: value,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select admin status" />
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
            <Button onClick={saveNewAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Modal */}
      {selectedAdmin && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Admin User</DialogTitle>
              <DialogDescription>
                Update admin user information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Enter admin name"
                  value={newAdmin.fullName}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      fullName: e.target.value,
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
                  placeholder="Enter admin phone number"
                  value={newAdmin.phoneNumber}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      phoneNumber: e.target.value,
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
                  placeholder="Enter admin email"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({
                      ...newAdmin,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-permission">Permission</Label>
                <Select
                  value={newAdmin.permission}
                  onValueChange={(value: "Superadmin" | "Admin") =>
                    setNewAdmin({
                      ...newAdmin,
                      permission: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-permission">
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Superadmin">Superadmin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={newAdmin.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setNewAdmin({
                      ...newAdmin,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select admin status" />
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
              <Button onClick={saveEditedAdmin}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Admin Modal */}
      {selectedAdmin && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Admin User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this admin user? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Admin Name:</span>
                <span className="font-bold">{selectedAdmin.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Email:</span>
                <span>{selectedAdmin.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Permission:</span>
                <span>{selectedAdmin.permission}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteAdmin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
