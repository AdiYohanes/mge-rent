"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, RefreshCw, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getFAQs, addFAQ, updateFAQ, deleteFAQ } from "@/api";

export function FAQTable() {
    const [faqs, setFaqs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Dialog states
    const [isAddFAQOpen, setIsAddFAQOpen] = useState(false);
    const [isEditFAQOpen, setIsEditFAQOpen] = useState(false);
    const [isDeleteFAQOpen, setIsDeleteFAQOpen] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState(null);

    const [newFAQ, setNewFAQ] = useState({
        question: "",
        answer: ""
    });

    // Fetch FAQs from API
    useEffect(() => {
        fetchFAQs();
    }, [currentPage, itemsPerPage, searchTerm]);

    const fetchFAQs = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching FAQs...");
            const response = await getFAQs(currentPage, itemsPerPage, searchTerm);

            console.log("API response:", response);

            // Handle different possible response formats
            let faqsArray = [];
            let total = 0;
            let pages = 1;

            if (response && Array.isArray(response.faqs)) {
                // Standard expected format
                faqsArray = response.faqs;
                total = response.total || response.faqs.length;
                pages = response.totalPages || Math.ceil(total / itemsPerPage);
            } else if (response && Array.isArray(response.data)) {
                // Alternative format with data property
                faqsArray = response.data;
                total = response.total || response.data.length;
                pages = response.totalPages || Math.ceil(total / itemsPerPage);
            } else if (Array.isArray(response)) {
                // Direct array response
                faqsArray = response;
                total = response.length;
                pages = Math.ceil(total / itemsPerPage);
            } else {
                throw new Error("Unexpected API response format");
            }

            setFaqs(faqsArray);
            setTotalItems(total);
            setTotalPages(pages || 1);

            if (faqsArray.length === 0 && total > 0 && currentPage > 1) {
                // If we're on a page with no items but there are items on earlier pages,
                // go back to the first page
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Error fetching FAQs:", err);
            setError(`Failed to load FAQs: ${err?.message || "Unknown error"}`);
            toast.error("Failed to load FAQs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Filter FAQs based on search term (client-side filtering as backup)
    const filteredFAQs = faqs.filter(faq =>
        faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle adding new FAQ
    const handleAddFAQ = async () => {
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);

            const faqData = {
                question: newFAQ.question,
                answer: newFAQ.answer
            };

            const response = await addFAQ(faqData);

            if (response) {
                toast.success("Question added successfully", {
                    description: "The new question has been added to the FAQ list.",
                    duration: 3000
                });

                setIsAddFAQOpen(false);
                setNewFAQ({ question: "", answer: "" });
                fetchFAQs(); // Refresh data
            } else {
                toast.error("Failed to add question");
            }
        } catch (err) {
            console.error("Error adding FAQ:", err);
            toast.error(`Error: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle editing FAQ
    const handleEditFAQ = async () => {
        if (!currentFAQ || !newFAQ.question || !newFAQ.answer) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);

            const faqData = {
                question: newFAQ.question,
                answer: newFAQ.answer
            };

            const response = await updateFAQ(currentFAQ.id.toString(), faqData);

            if (response) {
                toast.success("Question updated successfully", {
                    description: "The FAQ has been updated with new information.",
                    duration: 3000
                });

                setCurrentFAQ(null);
                setNewFAQ({ question: "", answer: "" });
                setIsEditFAQOpen(false);
                fetchFAQs(); // Refresh data
            } else {
                toast.error("Failed to update question");
            }
        } catch (err) {
            console.error("Error updating FAQ:", err);
            toast.error(`Error: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle deleting FAQ
    const handleDeleteFAQ = async () => {
        if (!currentFAQ) return;

        try {
            setLoading(true);

            const success = await deleteFAQ(currentFAQ.id.toString());

            if (success) {
                toast.success("Question deleted successfully", {
                    description: "The question has been removed from the FAQ list.",
                    duration: 3000
                });

                setCurrentFAQ(null);
                setIsDeleteFAQOpen(false);
                fetchFAQs(); // Refresh data
            } else {
                toast.error("Failed to delete question");
            }
        } catch (err) {
            console.error("Error deleting FAQ:", err);
            toast.error(`Error: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Open edit dialog
    const openEditDialog = (faq) => {
        setCurrentFAQ(faq);
        setNewFAQ({ question: faq.question, answer: faq.answer });
        setIsEditFAQOpen(true);
    };

    // Open delete dialog
    const openDeleteDialog = (faq) => {
        setCurrentFAQ(faq);
        setIsDeleteFAQOpen(true);
    };

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 7; // Show at most 7 page buttons

        // Previous button
        buttons.push(
            <Button
                key="prev"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 w-8 p-0 rounded-full"
            >
                &lt;
            </Button>
        );

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                buttons.push(
                    <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className={`h-8 w-8 p-0 rounded-full ${currentPage === i ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                        disabled={loading}
                    >
                        {i}
                    </Button>
                );
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                buttons.push(
                    <span key={i} className="mx-1">...</span>
                );
            }
        }

        // Next button
        buttons.push(
            <Button
                key="next"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                    <h2 className="text-2xl font-bold">List FAQ</h2>

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
                            onClick={fetchFAQs}
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
                            className="bg-amber-500 hover:bg-amber-600 h-9"
                            onClick={() => setIsAddFAQOpen(true)}
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Question
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
                                <TableHead>QUESTION</TableHead>
                                <TableHead>ANSWER</TableHead>
                                <TableHead className="w-[100px] text-center">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6">
                                        Loading FAQs...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-red-500">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : filteredFAQs.length > 0 ? (
                                filteredFAQs.map((faq, index) => (
                                    <TableRow key={faq.id}>
                                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell className="font-medium">{faq.question}</TableCell>
                                        <TableCell>{faq.answer}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-500 border-amber-500"
                                                    onClick={() => openEditDialog(faq)}
                                                    disabled={loading}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 border-red-500"
                                                    onClick={() => openDeleteDialog(faq)}
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
                                    <TableCell colSpan={4} className="text-center py-6">
                                        No FAQs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                        Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </div>

                    <div className="flex gap-1">
                        {renderPaginationButtons()}
                    </div>
                </div>
            </CardContent>

            {/* Add FAQ Dialog */}
            <Dialog open={isAddFAQOpen} onOpenChange={setIsAddFAQOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="question">
                                Question <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="question"
                                value={newFAQ.question}
                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="answer">
                                Answer <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="answer"
                                value={newFAQ.answer}
                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 w-full md:w-auto"
                            onClick={handleAddFAQ}
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Question"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit FAQ Dialog */}
            <Dialog open={isEditFAQOpen} onOpenChange={setIsEditFAQOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-question">
                                Question <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-question"
                                value={newFAQ.question}
                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-answer">
                                Answer <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="edit-answer"
                                value={newFAQ.answer}
                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 w-full md:w-auto"
                            onClick={handleEditFAQ}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete FAQ Dialog */}
            <Dialog open={isDeleteFAQOpen} onOpenChange={setIsDeleteFAQOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete FAQ</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <p>Are you sure you want to delete this FAQ? This action cannot be undone.</p>
                        {currentFAQ && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <p className="font-medium">{currentFAQ.question}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteFAQOpen(false)}
                            className="w-full md:w-auto"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 w-full md:w-auto"
                            onClick={handleDeleteFAQ}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 