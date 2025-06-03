"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { getBookings, Booking, CustomerData } from "@/api";

// Type for our processed transaction data
interface Transaction {
  id: string;
  transactionNumber: string;
  type: string;
  name: string;
  phoneNumber: string;
  details: string;
  quantity: string;
  bookingDate: string;
  totalPayment: string;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  totalRefund: string;
}

export function TransactionTable() {
  // State for data filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Transaction>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [month, setMonth] = useState("3");
  const [year, setYear] = useState("2023");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking data from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getBookings(
          currentPage,
          itemsPerPage,
          "success"
        );

        // Filter for bookings with "success" status
        const successBookings = response.data.filter(
          (booking: Booking) => booking.status === "success"
        );

        // Transform API data to match our transaction structure
        const transformedData: Transaction[] = successBookings.map(
          (booking: Booking) => {
            // Default customer data in case parsing fails or data is missing
            let customerData: CustomerData = {
              name: "Unknown",
              phone: "Unknown",
            };

            // Only try to parse if customer_data exists and is not null
            if (booking.customer_data) {
              try {
                const parsedData = JSON.parse(booking.customer_data);

                // Ensure parsedData has the required properties
                if (parsedData && typeof parsedData === "object") {
                  customerData = {
                    name: parsedData.name || "Unknown",
                    phone: parsedData.phone || "Unknown",
                  };
                }
              } catch (error) {
                console.error("Error parsing customer data:", error);
                // Keep using the default values set above
              }
            }

            // Format the booking date safely
            let formattedDate = "Unknown";
            if (booking.booking_date) {
              try {
                const bookingDate = new Date(booking.booking_date);
                if (!isNaN(bookingDate.getTime())) {
                  formattedDate = `${bookingDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${(bookingDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${bookingDate.getFullYear()}`;
                }
              } catch (error) {
                console.error("Error formatting booking date:", error);
              }
            }

            // Format created_at for payment date safely
            let formattedPaymentDate = "Unknown";
            if (booking.created_at) {
              try {
                const paymentDate = new Date(booking.created_at);
                if (!isNaN(paymentDate.getTime())) {
                  formattedPaymentDate = `${paymentDate
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${(paymentDate.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${paymentDate.getFullYear()}`;
                }
              } catch (error) {
                console.error("Error formatting payment date:", error);
              }
            }

            // Calculate duration safely
            const duration = booking.duration || 0;

            return {
              id: booking.id ? booking.id.toString() : "0",
              transactionNumber: `TRX${
                booking.id ? booking.id.toString().padStart(6, "0") : "000000"
              }`,
              type: "Room", // Assuming all bookings are for rooms
              name: customerData.name,
              phoneNumber: customerData.phone,
              details: `Booking for ${booking.event_name || "Unknown Event"}`,
              quantity: `${duration} hrs`,
              bookingDate: formattedDate,
              totalPayment: `Rp${(duration * 50000).toLocaleString()}`, // Example calculation
              paymentMethod: "QRIS", // Assuming QRIS for all
              paymentDate: formattedPaymentDate,
              status: "booking_success", // Mapping API "success" to UI "booking_success"
              totalRefund: "Rp0", // Default no refund
            };
          }
        );

        setTransactions(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load transaction data");
        // Keep showing example data for development if API fails
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage, itemsPerPage]);

  // Sort and filter data
  const filteredData = transactions
    .filter((transaction) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        transaction.transactionNumber.toLowerCase().includes(searchTermLower) ||
        transaction.name.toLowerCase().includes(searchTermLower) ||
        transaction.type.toLowerCase().includes(searchTermLower) ||
        transaction.phoneNumber.toLowerCase().includes(searchTermLower) ||
        transaction.details.toLowerCase().includes(searchTermLower)
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortField].toString().toLowerCase();
      const fieldB = b[sortField].toString().toLowerCase();

      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginatedData = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Generate pagination buttons
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
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  const getMonthName = (monthNumber: string) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[parseInt(monthNumber) - 1];
  };

  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booking_success":
        return (
          <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-300">
            Booking Success
          </Badge>
        );
      case "booking_ongoing":
        return (
          <Badge className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-300">
            Booking Ongoing
          </Badge>
        );
      case "booking_finish":
        return (
          <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-300">
            Booking Finish
          </Badge>
        );
      case "booking_canceled":
        return (
          <Badge className="bg-red-100 hover:bg-red-100 text-red-800 border-red-300">
            Booking Canceled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-white py-4 px-6 border-b">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">List Transaction</h2>

          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Show</span>
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
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm font-medium">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-8 w-[110px]">
                  <SelectValue placeholder={getMonthName(month)} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getMonthName(String(m))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue placeholder={year} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - 2 + i
                  ).map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 pr-4 h-9"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto" style={{ minWidth: "100%" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
              <p className="mt-4 text-gray-600">Loading transaction data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
              >
                Retry
              </Button>
            </div>
          ) : (
            <Table className="w-auto min-w-full">
              <TableHeader className="bg-gray-50 whitespace-nowrap">
                <TableRow>
                  <TableHead className="w-[60px] min-w-[60px]">NO</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                    onClick={() => handleSort("transactionNumber")}
                  >
                    <div className="flex items-center">
                      NO. TRANSAKSI
                      {sortField === "transactionNumber" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[100px]"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      TYPE
                      {sortField === "type" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[120px]"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      NAME
                      {sortField === "name" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px]">PHONE NUMBER</TableHead>
                  <TableHead className="min-w-[150px]">DETAILS</TableHead>
                  <TableHead className="min-w-[100px]">QUANTITY</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                    onClick={() => handleSort("bookingDate")}
                  >
                    <div className="flex items-center">
                      TANGGAL BOOKING
                      {sortField === "bookingDate" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[160px]"
                    onClick={() => handleSort("totalPayment")}
                  >
                    <div className="flex items-center">
                      TOTAL PEMBAYARAN
                      {sortField === "totalPayment" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px]">
                    METODE PEMBAYARAN
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    TANGGAL PEMBAYARAN
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-100 min-w-[140px]"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      STATUS
                      {sortField === "status" && (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[120px]">TOTAL REFUND</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="whitespace-nowrap">
                {paginatedData.length > 0 ? (
                  paginatedData.map((transaction, index) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell>{firstIndex + index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {transaction.transactionNumber}
                      </TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.name}</TableCell>
                      <TableCell>{transaction.phoneNumber}</TableCell>
                      <TableCell>{transaction.details}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.bookingDate}</TableCell>
                      <TableCell>{transaction.totalPayment}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>{transaction.paymentDate}</TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>{transaction.totalRefund}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-6">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            {filteredData.length > 0
              ? Math.min(
                  filteredData.length,
                  (currentPage - 1) * itemsPerPage + 1
                )
              : 0}
            -{Math.min(filteredData.length, currentPage * itemsPerPage)} of{" "}
            {filteredData.length} entries
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">{paginationButtons()}</div>
        )}
      </CardFooter>
    </Card>
  );
}
