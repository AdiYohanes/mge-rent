"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getPromos,
  addPromo,
  updatePromo,
  deletePromo,
  Promo,
  PromoPayload,
} from "@/api";

interface NewPromoState {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  discount_amount: string;
  is_active: boolean;
}

export function PromoTable() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Add Promo dialog state
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromo, setNewPromo] = useState<NewPromoState>({
    name: "",
    code: "",
    type: "percentage",
    discount_amount: "",
    is_active: true,
  });

  // Delete Promo dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<Promo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch promos from API
  useEffect(() => {
    fetchPromos();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchPromos = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching promos...");
      const response = await getPromos(currentPage, itemsPerPage, searchTerm);

      console.log("API response:", response);

      // Handle different possible response formats
      let promosArray: Promo[] = [];
      let total = 0;
      let pages = 1;

      if (response && Array.isArray(response.promos)) {
        // Standard expected format
        promosArray = response.promos;
        total = response.total || response.promos.length;
        pages = response.totalPages || Math.ceil(total / itemsPerPage);
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        // Alternative format with data property
        promosArray = response.data as Promo[];
        total =
          "total" in response ? (response.total as number) : promosArray.length;
        pages =
          "totalPages" in response
            ? (response.totalPages as number)
            : Math.ceil(total / itemsPerPage);
      } else if (Array.isArray(response)) {
        // Direct array response
        promosArray = response;
        total = response.length;
        pages = Math.ceil(total / itemsPerPage);
      } else {
        throw new Error("Unexpected API response format");
      }

      setPromos(promosArray);
      setTotalItems(total);
      setTotalPages(pages || 1);

      if (promosArray.length === 0 && total > 0 && currentPage > 1) {
        // If we're on a page with no items but there are items on earlier pages,
        // go back to the first page
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error fetching promos:", err);
      setError(
        `Failed to load promos: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      toast.error("Failed to load promos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter promos based on search term (client-side filtering as backup)
  const filteredPromos = promos.filter(
    (promo) =>
      promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle toggling promo activation
  const handleToggleActive = async (id: number) => {
    try {
      const promoToToggle = promos.find((p) => p.id === id);
      if (!promoToToggle) return;

      const newStatus = !promoToToggle.is_active;

      // Update UI optimistically
      setPromos(
        promos.map((promo) =>
          promo.id === id ? { ...promo, is_active: newStatus } : promo
        )
      );

      // Create a complete payload with all required fields
      const promoPayload: PromoPayload = {
        name: promoToToggle.name,
        code: promoToToggle.code,
        type: promoToToggle.type as "percentage" | "fixed",
        discount_amount: promoToToggle.discount_amount,
        is_active: newStatus,
      };

      // Call API to update promo with all required fields
      const updatedPromo = await updatePromo(id.toString(), promoPayload);

      if (!updatedPromo) {
        // Revert UI if API call failed
        setPromos(
          promos.map((promo) =>
            promo.id === id ? { ...promo, is_active: !newStatus } : promo
          )
        );
        toast.error("Failed to update promo status");
      } else {
        toast.success(
          `Promo ${newStatus ? "activated" : "deactivated"} successfully`
        );
      }
    } catch (err) {
      console.error("Error toggling promo status:", err);
      toast.error(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );

      // Refresh data to ensure UI is in sync with server
      fetchPromos();
    }
  };

  // Open delete dialog
  const openDeleteDialog = (promo: Promo) => {
    setCurrentPromo(promo);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete promo
  const handleDeletePromo = async () => {
    if (!currentPromo) return;

    setDeleteLoading(true);

    try {
      console.log(`Deleting promo with ID: ${currentPromo.id}`);

      // Call API to delete promo
      const success = await deletePromo(currentPromo.id.toString());

      if (success) {
        toast.success("Promo deleted successfully!");
        // Close dialog and clear selection
        setIsDeleteDialogOpen(false);
        setCurrentPromo(null);
        // Refresh data
        fetchPromos();
      } else {
        throw new Error(
          "Failed to delete promo. API returned unsuccessful response."
        );
      }
    } catch (error) {
      console.error("Error deleting promo:", error);
      toast.error(
        `Failed to delete promo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle adding new promo
  const handleAddPromo = async () => {
    if (!newPromo.name || !newPromo.code || !newPromo.discount_amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const promoData: PromoPayload = {
        name: newPromo.name,
        code: newPromo.code,
        type: newPromo.type || "percentage",
        discount_amount: parseFloat(newPromo.discount_amount),
        is_active: newPromo.is_active,
      };

      const response = await addPromo(promoData);

      if (response) {
        toast.success("Promo added successfully");
        setIsAddPromoOpen(false);
        setNewPromo({
          name: "",
          code: "",
          type: "percentage",
          discount_amount: "",
          is_active: true,
        });
        fetchPromos(); // Refresh data
      } else {
        toast.error("Failed to add promo");
      }
    } catch (err) {
      console.error("Error adding promo:", err);
      toast.error(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
        className="h-8 w-8 p-0 rounded-full"
      >
        &lt;
      </Button>
    );

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
            className={`h-8 w-8 p-0 rounded-full ${
              currentPage === i ? "bg-[#B99733] hover:bg-amber-600" : ""
            }`}
            disabled={loading}
          >
            {i}
          </Button>
        );
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        buttons.push(
          <span key={i} className="mx-1">
            ...
          </span>
        );
      }
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || loading}
        className="h-8 w-8 p-0 rounded-full"
      >
        &gt;
      </Button>
    );

    return buttons;
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Promo Management</h2>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Show</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">entries</span>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 w-full sm:w-[200px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={loading}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPromos}
              disabled={loading}
              className="h-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>

            <Button
              className="bg-[#B99733] hover:bg-amber-600 h-9"
              onClick={() => setIsAddPromoOpen(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Promo
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[60px]">NO</TableHead>
                <TableHead>PROMO CODE</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>DISCOUNT</TableHead>
                <TableHead>PROMO ACTIVE</TableHead>
                <TableHead className="text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading promos...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredPromos.length > 0 ? (
                filteredPromos.map((promo, index) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      {promo.type === "percentage"
                        ? `${promo.discount_amount}%`
                        : `Rp ${promo.discount_amount.toLocaleString("id-ID")}`}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={() => handleToggleActive(promo.id)}
                        className={promo.is_active ? "bg-amber-500" : ""}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 border-red-500"
                          onClick={() => openDeleteDialog(promo)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No promos found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500 mb-4 sm:mb-0">
            Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
            to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
            {totalItems} entries
          </div>

          <div className="flex gap-1">{renderPaginationButtons()}</div>
        </div>
      </CardContent>

      {/* Add Promo Dialog */}
      <Dialog open={isAddPromoOpen} onOpenChange={setIsAddPromoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Promo</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="promo-name">
                Promo Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="promo-name"
                value={newPromo.name}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, name: e.target.value })
                }
                placeholder="Promo name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promo-code">
                Promo Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="promo-code"
                value={newPromo.code}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, code: e.target.value })
                }
                placeholder="PROMO10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount-type">
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newPromo.type}
                onValueChange={(value: "percentage" | "fixed") =>
                  setNewPromo({ ...newPromo, type: value })
                }
              >
                <SelectTrigger id="discount-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount-amount">
                {newPromo.type === "percentage" ? "Percentage" : "Amount"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="discount-amount"
                  type="number"
                  min="0"
                  max={newPromo.type === "percentage" ? "100" : ""}
                  value={newPromo.discount_amount}
                  onChange={(e) =>
                    setNewPromo({
                      ...newPromo,
                      discount_amount: e.target.value,
                    })
                  }
                  className="pr-8"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">
                    {newPromo.type === "percentage" ? "%" : "Rp"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="active">
                Promo Activation <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newPromo.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setNewPromo({ ...newPromo, is_active: value === "active" })
                }
              >
                <SelectTrigger id="active" className="w-full">
                  <SelectValue placeholder="Active" />
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
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 w-full md:w-auto"
              onClick={handleAddPromo}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Promo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Promo Dialog */}
      {currentPromo && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Promo</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this promo? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Promo Code:</span>
                <span className="font-bold">{currentPromo.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Description:</span>
                <span>{currentPromo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Discount:</span>
                <span>
                  {currentPromo.type === "percentage"
                    ? `${currentPromo.discount_amount}%`
                    : `Rp ${currentPromo.discount_amount.toLocaleString(
                        "id-ID"
                      )}`}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePromo}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
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
