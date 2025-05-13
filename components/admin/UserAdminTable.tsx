"use client";

import { useState } from "react";
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

// Dummy data untuk tabel admin
const adminData: Admin[] = [
  {
    id: 1,
    fullName: "Cody",
    phoneNumber: "081234567890",
    email: "ustil@mail.ru",
    permission: "Superadmin",
    status: "active",
    registrationDate: "2025-01-10",
  },
  {
    id: 2,
    fullName: "Darlene",
    phoneNumber: "081998765432",
    email: "bertou@yandex.ru",
    permission: "Admin",
    status: "active",
    registrationDate: "2025-01-05",
  },
  {
    id: 3,
    fullName: "Eduardo",
    phoneNumber: "081387654321",
    email: "irnabela@gmail.com",
    permission: "Superadmin",
    status: "active",
    registrationDate: "2025-01-20",
  },
  {
    id: 4,
    fullName: "Cameron",
    phoneNumber: "085565432109",
    email: "ahana@mail.ru",
    permission: "Admin",
    status: "active",
    registrationDate: "2025-02-01",
  },
  {
    id: 5,
    fullName: "Colleen",
    phoneNumber: "081787654321",
    email: "redaniel@gmail.com",
    permission: "Admin",
    status: "active",
    registrationDate: "2025-02-10",
  },
  {
    id: 6,
    fullName: "Mitchell",
    phoneNumber: "081887654321",
    email: "ulfaha@mail.ru",
    permission: "Superadmin",
    status: "active",
    registrationDate: "2025-02-15",
  },
  {
    id: 7,
    fullName: "Aubrey",
    phoneNumber: "085765432109",
    email: "igerrin@gmail.com",
    permission: "Superadmin",
    status: "active",
    registrationDate: "2025-03-01",
  },
  {
    id: 8,
    fullName: "Operation Admin",
    phoneNumber: "085765432109",
    email: "operations@example.com",
    permission: "Superadmin",
    status: "active",
    registrationDate: "2025-03-05",
  },
];

export function UserAdminTable() {
  // State untuk data dan filter
  const [admins, setAdmins] = useState<Admin[]>(adminData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Admin>("fullName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // Filter dan sort data
  const filteredData = admins
    .filter((admin) => {
      return (
        admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phoneNumber.includes(searchTerm)
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
  const handleSort = (field: keyof Admin) => {
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

    // Delete admin (in a real app, this would be an API call)
    const updatedAdmins = admins.filter(
      (admin) => admin.id !== selectedAdmin.id
    );

    setAdmins(updatedAdmins);
    setIsDeleteModalOpen(false);
    setSelectedAdmin(null);

    toast.success("Admin deleted successfully!");
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
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((admin, index) => (
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
          Showing {paginatedData.length > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} entries
        </div>
        <div className="space-x-1">{paginationButtons()}</div>
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
                Are you sure you want to delete {selectedAdmin.fullName}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteAdmin}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
