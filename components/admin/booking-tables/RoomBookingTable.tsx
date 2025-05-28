"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { BookingTableBaseProps, RoomBooking, formatCurrency } from "./types";
import { StatusBadge, months, years } from "./shared-components";

// Import API functions
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  Booking,
} from "@/api/booking/bookingApi";

// Import Unit API functions
import { getUnits, Unit } from "@/api/unit/unitApi";
import { getGames, Game as GameType } from "@/api/game/gameApi";

// Add OTS Booking Form Schema
const addOTSBookingSchema = z.object({
  customerName: z
    .string()
    .min(3, "Customer name must be at least 3 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  unitId: z.coerce.number().min(1, "Please select a unit"),
  gameId: z.coerce.number().optional(),
  bookingDate: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  duration: z.coerce.number().min(60, "Duration must be at least 60 minutes"),
  totalCustomer: z.coerce.number().min(1, "At least 1 customer required"),
});

// Edit Booking Form Schema
const editBookingSchema = z.object({
  bookingId: z.coerce.number().min(1),
  unitId: z.coerce.number().min(1, "Please select a unit"),
  gameId: z.coerce.number().optional(),
  bookingDate: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  duration: z.coerce.number().min(60, "Duration must be at least 60 minutes"),
  totalCustomer: z.coerce.number().min(1, "At least 1 customer required"),
  status: z.enum(
    ["success", "cancelled", "refunded", "completed", "rescheduled"],
    {
      errorMap: () => ({
        message:
          "Invalid status selected. Must be one of: success, cancelled, refunded, completed, rescheduled.",
      }),
    }
  ),
});

// Update BookingStatus enum untuk sesuai dengan permintaan
export type BookingStatus =
  | "success"
  | "cancelled"
  | "refunded"
  | "completed"
  | "rescheduled";

const RoomBookingTable: React.FC<BookingTableBaseProps> = ({
  filterStatus,
}) => {
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("booking_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [selectedMonth, setSelectedMonth] = useState<string>("all_months");
  const [selectedYear, setSelectedYear] = useState<string>("all_years");

  // State for modals
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    useState<boolean>(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<RoomBooking | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [isOTSBookingModalOpen, setIsOTSBookingModalOpen] =
    useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // State for API data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>(
    {}
  );

  // Update unitOptions to use real units from API
  const [unitOptions, setUnitOptions] = useState<Unit[]>([]);

  // Update gameOptions to use real games from API instead of hardcoded values
  const [gameOptions, setGameOptions] = useState<GameType[]>([]);
  const [timeOptions, setTimeOptions] = useState<string[]>([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ]);

  // Add the forms
  const addOTSForm = useForm<z.infer<typeof addOTSBookingSchema>>({
    resolver: zodResolver(addOTSBookingSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      unitId: 0,
      gameId: undefined,
      duration: 60,
      totalCustomer: 1,
    },
  });

  const editBookingForm = useForm<z.infer<typeof editBookingSchema>>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      bookingId: 0,
      unitId: 0,
      gameId: undefined,
      duration: 60,
      totalCustomer: 1,
      status: "success",
    },
  });

  // Function to fetch bookings from API
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine status filter
      let statusFilter: string | undefined = undefined;
      if (filterStatus) {
        if (Array.isArray(filterStatus)) {
          // If multiple statuses, use the first one for simplicity (API might need updating to handle multiple)
          statusFilter = filterStatus[0];
        } else {
          statusFilter = filterStatus;
        }
      }

      // Determine date filters based on month/year selection
      let dateStart = dateRange.start;
      let dateEnd = dateRange.end;

      if (selectedYear !== "all_years" && selectedMonth !== "all_months") {
        const year = parseInt(selectedYear);
        const month = parseInt(selectedMonth);

        // Calculate the number of days in the selected month
        // Month in JS Date is 0-indexed (0 = January), but our selectedMonth is 1-indexed
        // So we use month directly for the next month and 0 for day to get last day of current month
        const daysInMonth = new Date(year, month, 0).getDate();

        // Format with proper padding for YYYY-MM-DD format
        const monthStr = month.toString().padStart(2, "0");
        dateStart = `${year}-${monthStr}-01`;
        dateEnd = `${year}-${monthStr}-${daysInMonth
          .toString()
          .padStart(2, "0")}`;

        console.log(
          `Filtering for ${year}-${monthStr}: ${dateStart} to ${dateEnd}`
        );
      } else if (selectedYear !== "all_years") {
        // Full year selected
        dateStart = `${selectedYear}-01-01`;
        dateEnd = `${selectedYear}-12-31`;
        console.log(
          `Filtering for year ${selectedYear}: ${dateStart} to ${dateEnd}`
        );
      } else if (selectedMonth !== "all_months") {
        // Only month selected (use current year)
        const currentYear = new Date().getFullYear();
        const month = parseInt(selectedMonth);

        // Calculate days in month same as above
        const daysInMonth = new Date(currentYear, month, 0).getDate();

        // Format with proper padding
        const monthStr = month.toString().padStart(2, "0");
        dateStart = `${currentYear}-${monthStr}-01`;
        dateEnd = `${currentYear}-${monthStr}-${daysInMonth
          .toString()
          .padStart(2, "0")}`;

        console.log(
          `Filtering for month ${monthStr}/${currentYear}: ${dateStart} to ${dateEnd}`
        );
      }

      // Call API with filters
      console.log("Calling API with date filters:", { dateStart, dateEnd });

      const response = await getBookings(
        currentPage,
        itemsPerPage,
        statusFilter,
        dateStart,
        dateEnd
      );

      console.log("API response:", response);
      setBookings(response.data);
      setTotalBookings(response.meta.total);
      setTotalPages(response.meta.lastPage);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    filterStatus,
    selectedMonth,
    selectedYear,
    dateRange,
  ]);

  // Fetch bookings when dependencies change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Function to fetch units from API
  const fetchUnits = useCallback(async () => {
    try {
      const response = await getUnits(1, 100); // Get first 100 units
      console.log("Units response:", response);
      if (response && Array.isArray(response.data)) {
        setUnitOptions(response.data);
        console.log("Units loaded successfully:", response.data.length);
      } else {
        console.error("Invalid units response format:", response);
      }
    } catch (err: unknown) {
      console.error("Error fetching units:", err);

      // Type guard for error with response property
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      const errorMessage =
        error?.response?.data?.message || "Failed to load units";

      // Check if it's an authentication error
      if (error?.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        // You might want to redirect to login page here
        // or use your auth context to handle this situation
        return;
      }

      toast.error(`Failed to load units: ${errorMessage}`);
      // Set empty array to prevent rendering errors
      setUnitOptions([]);
    }
  }, []);

  // Function to fetch games from API
  const fetchGames = useCallback(async () => {
    try {
      const response = await getGames(); // Get all games
      console.log("Games response:", response);
      if (response && Array.isArray(response.games)) {
        setGameOptions(response.games);
        console.log("Games loaded successfully:", response.games.length);
      } else {
        console.error("Invalid games response format:", response);
      }
    } catch (err: unknown) {
      console.error("Error fetching games:", err);

      // Type guard for error with response property
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
      };

      const errorMessage =
        error?.response?.data?.message || "Failed to load games";

      // Check if it's an authentication error
      if (error?.response?.status === 401) {
        toast.error("Authentication required. Please log in again.");
        // You might want to redirect to login page here
        // or use your auth context to handle this situation
        return;
      }

      toast.error(`Failed to load games: ${errorMessage}`);
      // Set empty array to prevent rendering errors
      setGameOptions([]);
    }
  }, []);

  // Update useEffect to fetch both units and games when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch both resources
        await Promise.allSettled([fetchUnits(), fetchGames()]);
      } catch (err) {
        console.error("Error initializing booking data:", err);
      }
    };

    fetchData();
  }, [fetchUnits, fetchGames]);

  // Convert API Booking to RoomBooking for UI
  const mapApiToRoomBooking = (booking: Booking): RoomBooking => {
    // Parse customer data
    let customerData: { name: string; phone: string } = { name: "", phone: "" };
    try {
      if (typeof booking.customer_data === "string") {
        customerData = JSON.parse(booking.customer_data);
      } else {
        customerData = booking.customer_data as { name: string; phone: string };
      }
    } catch (e) {
      console.error("Error parsing customer data:", e);
    }

    // Find unit name from unitOptions
    const unit = unitOptions.find((u) => u.id === booking.unit_id);
    const unitName = unit ? unit.name : `Unit ${booking.unit_id}`;

    // Find game name from gameOptions
    let gameTitle = "-";
    if (booking.game_id) {
      const game = gameOptions.find((g) => g.id === booking.game_id);
      if (game) {
        gameTitle = game.title;
      }
    }

    // Map API status to our status format
    let mappedStatus: BookingStatus = "success";
    switch (booking.status) {
      case "success":
        mappedStatus = "success";
        break;
      case "cancelled":
        mappedStatus = "cancelled";
        break;
      case "refunded":
        mappedStatus = "refunded";
        break;
      case "completed":
        mappedStatus = "completed";
        break;
      case "rescheduled":
        mappedStatus = "rescheduled";
        break;
      default:
        mappedStatus = "success"; // Default fallback
        break;
    }

    // Map API booking to UI booking
    return {
      id: booking.id.toString(),
      transactionNumber: `TRX-${booking.created_at
        .substring(0, 10)
        .replace(/-/g, "")}-${booking.id}`,
      customerName: customerData.name,
      phoneNumber: customerData.phone,
      status: mappedStatus,
      date: booking.booking_date,
      amount: 0, // API doesn't provide this, would need to be added
      paymentMethod: "N/A", // API doesn't provide this, would need to be added
      console: "PlayStation 5", // API doesn't provide this, would need to be added
      roomType: "Regular", // API doesn't provide this, would need to be added
      unitNumber: unitName, // Use the unit name instead of just "Unit X"
      totalPerson: parseInt(booking.total_customer || "1"),
      startTime: booking.start_time,
      endTime: "", // API doesn't provide this, would need to be calculated
      duration: `${booking.duration} minutes`, // Format as minutes
      gameId: booking.game_id, // Store game_id for reference
      gameTitle: gameTitle, // Add game title
    };
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search
    // Note: API search would need to be implemented server-side
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedMonth("all_months");
    setSelectedYear("all_years");
    setDateRange({});
    setCurrentPage(1);
    // This will trigger useEffect to reload data
  };

  // Handle sorting - Note: For real implementation, sorting should be done on server
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // Would need server implementation to sort data properly
  };

  // Handle reschedule booking
  const handleRescheduleBooking = async (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  // Save reschedule changes
  const saveRescheduleChanges = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      // Call API to update booking
      // Would need to extract the date and time from UI fields

      toast.success("Booking rescheduled successfully!");
      setIsRescheduleModalOpen(false);
      fetchBookings(); // Refresh data
    } catch (err) {
      console.error("Error rescheduling booking:", err);
      toast.error("Failed to reschedule booking");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refund booking
  const handleRefundBooking = async (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsRefundModalOpen(true);
  };

  // Process refund
  const processRefund = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      // Call API to process refund
      // This would likely be a custom endpoint for refunds

      toast.success("Refund processed successfully!");
      setIsRefundModalOpen(false);
      fetchBookings(); // Refresh data
    } catch (err) {
      console.error("Error processing refund:", err);
      toast.error("Failed to process refund");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate pagination buttons
  const paginationButtons = () => {
    const buttons = [];

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1 || isLoading}
        className="mr-1"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    // Page buttons
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
          disabled={isLoading}
          className="mx-0.5"
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
          disabled={isLoading}
          className="mx-0.5"
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
          disabled={isLoading}
          className="mx-0.5"
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
        disabled={currentPage === totalPages || isLoading}
        className="ml-1"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  // Update handleAddOTSBooking function to handle duration in minutes
  const handleAddOTSBooking = async (
    values: z.infer<typeof addOTSBookingSchema>
  ) => {
    try {
      setIsLoading(true);

      // Create customer data object
      const customerData = {
        name: values.customerName,
        phone: values.phoneNumber,
      };

      // Create booking payload
      const bookingPayload = {
        unit_id: values.unitId,
        game_id: values.gameId,
        booking_date: format(values.bookingDate, "yyyy-MM-dd"),
        start_time: values.startTime,
        duration: values.duration, // This is now in minutes (minimum 30)
        customer_data: customerData,
        total_customer: values.totalCustomer.toString(),
      };

      console.log("Sending booking payload:", bookingPayload);

      // Call API to create booking
      await createBooking(bookingPayload);

      toast.success("Booking created successfully!");
      setIsOTSBookingModalOpen(false);
      addOTSForm.reset();
      fetchBookings();
    } catch (err: unknown) {
      console.error("Error creating booking:", err);

      // Type guard for error with response property
      const error = err as {
        response?: { data?: { errors?: Record<string, string[]> } };
      };

      // Extract validation errors from API response if available
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        toast.error(`Validation error: ${errorMessages}`);
      } else {
        toast.error("Failed to create booking");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBooking = (booking: RoomBooking) => {
    try {
      console.log("Setting up edit form for booking:", booking);

      // Convert the booking to the form format
      const bookingDate = new Date(booking.date);

      // Extract unit ID from unitNumber if needed
      let unitId = 0;

      // Find matching unit from unitOptions using name
      const foundUnit = unitOptions.find(
        (unit) => unit.name === booking.unitNumber
      );
      if (foundUnit) {
        unitId = foundUnit.id;
      } else {
        // Fallback to parse unit ID from the string if format is "Unit X"
        const unitMatch = booking.unitNumber.match(/Unit (\d+)/);
        if (unitMatch && unitMatch[1]) {
          unitId = parseInt(unitMatch[1]);
        }
      }

      // Extract duration in minutes from string like "X minutes"
      let durationMinutes = 60; // Default to 60 minutes

      // Parse the duration from the booking duration string
      if (booking.duration.includes("minute")) {
        // If format is "X minutes"
        const minuteMatch = booking.duration.match(/(\d+)/);
        if (minuteMatch && minuteMatch[1]) {
          durationMinutes = parseInt(minuteMatch[1]);
        }
      } else if (booking.duration.includes("hour")) {
        // Legacy conversion - if format is "X hour(s)"
        const hourMatch = booking.duration.match(/(\d+(\.\d+)?)/);
        if (hourMatch && hourMatch[1]) {
          const durationHours = parseFloat(hourMatch[1]);
          durationMinutes = Math.round(durationHours * 60);
        }
      }

      // Ensure minimum duration is 60 minutes
      if (durationMinutes < 60) {
        durationMinutes = 60;
      }

      // CRITICAL: Ensure startTime is set correctly from booking
      console.log("Original booking startTime:", booking.startTime);

      // Ensure we have a valid startTime - first check booking.startTime, then fall back to timeOptions[0]
      let startTime = timeOptions[0];
      if (booking.startTime && booking.startTime.trim() !== "") {
        // Check if the time exists in our timeOptions
        if (timeOptions.includes(booking.startTime)) {
          startTime = booking.startTime;
        } else {
          // If not exact match, try to find closest 30-min interval
          const [hours, minutes] = booking.startTime.split(":").map(Number);
          const roundedMinutes = minutes >= 30 ? 30 : 0;
          const formattedTime = `${hours
            .toString()
            .padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;

          if (timeOptions.includes(formattedTime)) {
            startTime = formattedTime;
          }
        }
      }

      console.log("Selected startTime for form:", startTime);

      // Find game ID if available (from gameOptions)
      let gameId = undefined;
      if (booking.gameId) {
        gameId = booking.gameId;
      }

      // Pastikan status booking valid
      let status = booking.status;
      const validStatuses = [
        "success",
        "cancelled",
        "refunded",
        "completed",
        "rescheduled",
      ];
      if (!validStatuses.includes(status)) {
        status = "success"; // Default ke success jika tidak valid
        console.warn(
          `Invalid status "${status}" found, defaulting to "success"`
        );
      }

      console.log("Setting form values:", {
        bookingId: parseInt(booking.id),
        unitId: unitId,
        gameId: gameId,
        bookingDate: bookingDate,
        startTime: startTime,
        duration: durationMinutes,
        totalCustomer: booking.totalPerson,
        status: status,
      });

      // Penting: set nilai form sebelum membuka modal
      editBookingForm.reset({
        bookingId: parseInt(booking.id),
        unitId: unitId,
        gameId: gameId,
        bookingDate: bookingDate,
        startTime: startTime,
        duration: durationMinutes,
        totalCustomer: booking.totalPerson,
        status: status,
      });

      // Beri waktu untuk form di-reset sebelum membuka modal
      setTimeout(() => {
        setSelectedBooking(booking);
        setIsEditModalOpen(true);
      }, 50);
    } catch (err) {
      console.error("Error setting up edit form:", err);
      toast.error("Failed to prepare edit form");
    }
  };

  const handleUpdateBooking = async (
    values: z.infer<typeof editBookingSchema>
  ) => {
    try {
      setIsLoading(true);

      // Map status from UI format to API format
      let apiStatus = values.status;
      switch (values.status) {
        case "success":
          apiStatus = "success";
          break;
        case "cancelled":
          apiStatus = "cancelled";
          break;
        case "refunded":
          apiStatus = "refunded";
          break;
        case "completed":
          apiStatus = "completed";
          break;
        case "rescheduled":
          apiStatus = "rescheduled";
          break;
      }

      // Create booking payload
      const bookingPayload = {
        unit_id: values.unitId,
        game_id: values.gameId,
        booking_date: format(values.bookingDate, "yyyy-MM-dd"),
        start_time: values.startTime,
        duration: values.duration,
        total_customer: values.totalCustomer.toString(),
        status: apiStatus,
      };

      // Call API to update booking
      await updateBooking(values.bookingId.toString(), bookingPayload);

      toast.success("Booking updated successfully!");
      setIsEditModalOpen(false);
      fetchBookings();
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error("Failed to update booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (booking: RoomBooking) => {
    setSelectedBooking(booking);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);

      // Call API to delete booking
      await deleteBooking(selectedBooking.id);

      toast.success("Booking deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error("Failed to delete booking");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the getActionButtons function with edit and delete buttons
  const getActionButtons = (status: BookingStatus, booking: RoomBooking) => {
    return (
      <div className="flex items-center justify-end gap-2">
        {/* Edit Button - Available for all statuses */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-amber-500 text-amber-500"
                onClick={() => handleEditBooking(booking)}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Delete Button - Available for all statuses */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-red-500 text-red-500"
                onClick={() => handleDeleteClick(booking)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Status-specific action buttons */}
        {status === "success" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-blue-500 text-blue-500"
                  onClick={() => handleRescheduleBooking(booking)}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reschedule</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>List Booking Room</CardTitle>
            <CardDescription>Manage and view all room bookings</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Show:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                entries
              </span>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Date:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedMonth}
              onValueChange={(value) => {
                console.log("Selected month changed to:", value);
                setSelectedMonth(value);
                // Reset current page on filter change
                setCurrentPage(1);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_months">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={(value) => {
                console.log("Selected year changed to:", value);
                setSelectedYear(value);
                // Reset current page on filter change
                setCurrentPage(1);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_years">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedMonth !== "all_months" ||
              selectedYear !== "all_years") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Resetting date filters");
                  resetFilters();
                }}
                className="h-8"
                disabled={isLoading}
              >
                Reset
              </Button>
            )}
          </div>

          {selectedMonth !== "all_months" && selectedYear !== "all_years" && (
            <Badge variant="outline" className="ml-2">
              Filtering: {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </Badge>
          )}

          {/* Add OTS Booking Button */}
          <div className="ml-auto">
            <Button
              className="bg-[#B99733] hover:bg-[#a38429] text-white"
              onClick={() => setIsOTSBookingModalOpen(true)}
              disabled={isLoading}
            >
              Add OTS Booking
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-md">
            {error}
            <Button
              variant="link"
              className="ml-2 text-red-700 underline"
              onClick={fetchBookings}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 w-[150px]"
                  onClick={() => handleSort("transactionNumber")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    No. Transaction
                    {sortField === "transactionNumber" && (
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
                  onClick={() => handleSort("customerName")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Customer
                    {sortField === "customerName" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Phone Number
                </TableHead>
                <TableHead className="whitespace-nowrap">Console</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("roomType")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Room Type
                    {sortField === "roomType" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">Unit</TableHead>
                <TableHead className="whitespace-nowrap">Game</TableHead>
                <TableHead className="whitespace-nowrap">
                  Total Person
                </TableHead>
                <TableHead className="whitespace-nowrap">Start Time</TableHead>
                <TableHead className="whitespace-nowrap">Duration</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Date
                    {sortField === "date" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Total Payment
                    {sortField === "amount" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Payment Method
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown
                        className={`ml-1 h-3 w-3 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-24">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-2" />
                      <span>Loading bookings...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookings.length > 0 ? (
                bookings.map((booking, index) => {
                  const roomBooking = mapApiToRoomBooking(booking);
                  return (
                    <TableRow key={booking.id} className="hover:bg-gray-50">
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {roomBooking.transactionNumber}
                      </TableCell>
                      <TableCell>{roomBooking.customerName}</TableCell>
                      <TableCell>{roomBooking.phoneNumber}</TableCell>
                      <TableCell>{roomBooking.console}</TableCell>
                      <TableCell>{roomBooking.roomType}</TableCell>
                      <TableCell>{roomBooking.unitNumber}</TableCell>
                      <TableCell>{roomBooking.gameTitle}</TableCell>
                      <TableCell>{roomBooking.totalPerson}</TableCell>
                      <TableCell>{roomBooking.startTime}</TableCell>
                      <TableCell>{roomBooking.duration}</TableCell>
                      <TableCell>
                        {roomBooking.date
                          ? format(new Date(roomBooking.date), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(roomBooking.amount)}
                      </TableCell>
                      <TableCell>{roomBooking.paymentMethod}</TableCell>
                      <TableCell>
                        <StatusBadge status={roomBooking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {getActionButtons(roomBooking.status, roomBooking)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-6">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {bookings.length > 0
              ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                  totalBookings,
                  currentPage * itemsPerPage
                )} of ${totalBookings}`
              : "0-0 of 0"}{" "}
            entries
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center">{paginationButtons()}</div>
        )}
      </CardFooter>

      {/* ADD OTS BOOKING MODAL */}
      <Dialog
        open={isOTSBookingModalOpen}
        onOpenChange={setIsOTSBookingModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add On-The-Spot Booking</DialogTitle>
          </DialogHeader>
          <Form {...addOTSForm}>
            <form
              onSubmit={addOTSForm.handleSubmit(handleAddOTSBooking)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addOTSForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addOTSForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addOTSForm.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.length > 0 ? (
                            unitOptions.map((unit) => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="0" disabled>
                              No units available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addOTSForm.control}
                  name="gameId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {gameOptions.length > 0 ? (
                            gameOptions.map((game) => (
                              <SelectItem
                                key={game.id}
                                value={game.id.toString()}
                              >
                                {game.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-games" disabled>
                              No games available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addOTSForm.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Booking Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addOTSForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addOTSForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={60} step={30} {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 60 minutes, increments of 30
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={addOTSForm.control}
                  name="totalCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={20} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOTSBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* EDIT BOOKING MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <Form {...editBookingForm}>
            <form
              onSubmit={editBookingForm.handleSubmit(handleUpdateBooking)}
              className="space-y-4"
            >
              <div className="hidden">
                Current form values:{" "}
                {JSON.stringify(editBookingForm.getValues())}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editBookingForm.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.length > 0 ? (
                            unitOptions.map((unit) => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="0" disabled>
                              No units available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editBookingForm.control}
                  name="gameId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {gameOptions.length > 0 ? (
                            gameOptions.map((game) => (
                              <SelectItem
                                key={game.id}
                                value={game.id.toString()}
                              >
                                {game.title}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-games" disabled>
                              No games available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editBookingForm.control}
                  name="bookingDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Booking Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editBookingForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editBookingForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={60} step={30} {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 60 minutes, increments of 30
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editBookingForm.control}
                  name="totalCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={20} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editBookingForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete this booking?</p>
            {selectedBooking && (
              <div className="mt-2 p-3 bg-red-50 rounded-md border border-red-100 text-sm">
                <p>
                  <span className="font-semibold">Transaction:</span>{" "}
                  {selectedBooking.transactionNumber}
                </p>
                <p>
                  <span className="font-semibold">Customer:</span>{" "}
                  {selectedBooking.customerName}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {selectedBooking.date}
                </p>
              </div>
            )}
            <p className="mt-3 text-red-600 text-sm font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoomBookingTable;
