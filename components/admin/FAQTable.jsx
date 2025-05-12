"use client";

import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
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

// Sample FAQ data
const initialFAQs = [
    {
        id: 1,
        question: "Lorem Ipsum?",
        answer: "Nec ullamcorper sit amet risus nullam eget. Gravida in fermentum et sollicitudin ac orci phasellus."
    },
    {
        id: 2,
        question: "Lorem Ipsum?",
        answer: "Nec ullamcorper sit amet risus nullam eget. Gravida in fermentum et sollicitudin ac orci phasellus."
    },
    {
        id: 3,
        question: "Lorem Ipsum?",
        answer: "Nec ullamcorper sit amet risus nullam eget. Gravida in fermentum et sollicitudin ac orci phasellus."
    }
];

export function FAQTable() {
    const [faqs, setFaqs] = useState(initialFAQs);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Add FAQ dialog state
    const [isAddFAQOpen, setIsAddFAQOpen] = useState(false);
    const [isEditFAQOpen, setIsEditFAQOpen] = useState(false);
    const [isDeleteFAQOpen, setIsDeleteFAQOpen] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState(null);

    const [newFAQ, setNewFAQ] = useState({
        question: "",
        answer: ""
    });

    // Filter FAQs based on search term
    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentFAQs = filteredFAQs.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage);

    // Handle adding new FAQ
    const handleAddFAQ = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            return; // Don't add incomplete FAQs
        }

        const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;
        setFaqs([...faqs, { ...newFAQ, id: newId }]);
        setNewFAQ({ question: "", answer: "" });
        setIsAddFAQOpen(false);

        // Show success toast
        toast.success("Question added successfully", {
            description: "The new question has been added to the FAQ list.",
            duration: 3000
        });
    };

    // Handle editing FAQ
    const handleEditFAQ = () => {
        if (!currentFAQ || !newFAQ.question || !newFAQ.answer) {
            return;
        }

        const updatedFAQs = faqs.map(faq =>
            faq.id === currentFAQ.id ? { ...faq, question: newFAQ.question, answer: newFAQ.answer } : faq
        );

        setFaqs(updatedFAQs);
        setCurrentFAQ(null);
        setNewFAQ({ question: "", answer: "" });
        setIsEditFAQOpen(false);

        // Show success toast
        toast.success("Question updated successfully", {
            description: "The FAQ has been updated with new information.",
            duration: 3000
        });
    };

    // Handle deleting FAQ
    const handleDeleteFAQ = () => {
        if (!currentFAQ) return;

        const updatedFAQs = faqs.filter(faq => faq.id !== currentFAQ.id);
        setFaqs(updatedFAQs);
        setCurrentFAQ(null);
        setIsDeleteFAQOpen(false);

        // Show success toast
        toast.success("Question deleted successfully", {
            description: "The question has been removed from the FAQ list.",
            duration: 3000
        });
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
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
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
                            />
                        </div>

                        <Button
                            className="bg-amber-500 hover:bg-amber-600 h-9"
                            onClick={() => setIsAddFAQOpen(true)}
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
                            {currentFAQs.length > 0 ? (
                                currentFAQs.map((faq, index) => (
                                    <TableRow key={faq.id}>
                                        <TableCell>{firstIndex + index + 1}</TableCell>
                                        <TableCell className="font-medium">{faq.question}</TableCell>
                                        <TableCell>{faq.answer}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-500 border-amber-500"
                                                    onClick={() => openEditDialog(faq)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 border-red-500"
                                                    onClick={() => openDeleteDialog(faq)}
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
                        Showing {filteredFAQs.length > 0 ? firstIndex + 1 : 0} to {Math.min(lastIndex, filteredFAQs.length)} of {filteredFAQs.length} entries
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
                        >
                            Add Question
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
                        >
                            Save Changes
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
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 w-full md:w-auto"
                            onClick={handleDeleteFAQ}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 