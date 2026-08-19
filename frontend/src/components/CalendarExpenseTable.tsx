/**
 * Calendar expense table component - Responsive Design with Tailwind
 */

import { useEffect, useState } from "react";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { deleteExpense, updateExpense } from "../services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useToast } from "./Toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "./ui/table";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  pendingExpenseIds?: Set<number>;
  onExpenseUpdated: (updatedExpenses: Expense[]) => void;
}

const ITEMS_PER_PAGE = 5;

export function CalendarExpenseTable({
  expenses,
  pendingExpenseIds = new Set(),
  onExpenseUpdated,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();

  const totalPages = Math.max(1, Math.ceil(expenses.length / ITEMS_PER_PAGE));

  // Sort the complete collection before slicing so every page follows the
  // same newest-first order.
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  // Keep the current page valid after deleting records or changing filters.
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleEdit = (expense: Expense) => {
    // Don't allow editing if expense is still being created
    if (pendingExpenseIds.has(expense.id as number)) {
      showToast("Please wait for the expense to finish creating...", "error");
      return;
    }
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    // Don't allow deleting if expense is still being created
    if (pendingExpenseIds.has(expense.id as number)) {
      showToast("Please wait for the expense to finish creating...", "error");
      return;
    }
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    const expenseToDelete = deletingExpense;
    
    // Optimistic update: remove from UI immediately
    const updatedExpenses = expenses.filter((e) => e.id !== expenseToDelete.id);
    setIsDeleteModalOpen(false);
    setDeletingExpense(null);
    onExpenseUpdated(updatedExpenses);
    showToast("Expense deleted successfully", "success");
    
    try {
      // Perform actual deletion in background
      await deleteExpense(expenseToDelete.id);
    } catch (error) {
      // Rollback on failure: restore the deleted expense
      const rolledBackExpenses = [...expenses];
      onExpenseUpdated(rolledBackExpenses);
      showToast("Failed to delete expense. Restored.", "error");
    }
  };

  const handleEditSubmit = async (formData: ExpenseFormData) => {
    if (!editingExpense) return;
    const originalExpense = editingExpense;
    
    // Optimistic update: create preview of updated expense
    const optimisticExpense = {
      ...originalExpense,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
    };
    
    // Update UI immediately
    const optimisticExpenses = expenses.map((e) =>
      e.id === originalExpense.id ? optimisticExpense : e
    );
    setIsEditModalOpen(false);
    setEditingExpense(null);
    onExpenseUpdated(optimisticExpenses);
    showToast("Expense updated successfully", "success");
    
    try {
      // Perform actual update in background
      const updatedExpense = await updateExpense(originalExpense.id, formData);
      // Replace optimistic data with real server response
      const finalExpenses = expenses.map((e) =>
        e.id === originalExpense.id ? updatedExpense : e
      );
      onExpenseUpdated(finalExpenses);
    } catch (error) {
      // Rollback on failure: restore original expense
      const rolledBackExpenses = expenses.map((e) =>
        e.id === originalExpense.id ? originalExpense : e
      );
      onExpenseUpdated(rolledBackExpenses);
      showToast("Failed to update expense. Restored.", "error");
    }
  };

  const totalAmount = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0
  );

  const firstVisibleExpense = expenses.length === 0 ? 0 : startIndex + 1;
  const lastVisibleExpense = Math.min(endIndex, expenses.length);

  return (
    <div className="w-full space-y-4">
      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Total Expenses</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Transactions</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{expenses.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Average</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {expenses.length > 0 ? formatCurrency(totalAmount / expenses.length) : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* Table - Desktop View with shadcn/ui */}
      <div className="hidden sm:block rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableCaption className="sr-only">List of expenses for the selected period</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center w-[110px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 h-24">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              currentExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{formatDate(new Date(expense.date))}</TableCell>
                  <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                  <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        aria-label={`Edit ${expense.description}`}
                        title="Edit expense"
                        disabled={pendingExpenseIds.has(expense.id as number)}
className="inline-flex size-8 items-center justify-center border-0 bg-transparent p-0 text-blue-600 transition-colors hover:bg-transparent hover:text-blue-700 hover:drop-shadow-[0_1px_2px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        aria-label={`Delete ${expense.description}`}
                        title="Delete expense"
                        disabled={pendingExpenseIds.has(expense.id as number)}
className="inline-flex size-8 items-center justify-center border-0 bg-transparent p-0 text-red-600 transition-colors hover:bg-transparent hover:text-red-700 hover:drop-shadow-[0_1px_2px_rgba(220,38,38,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(totalAmount)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        {sortedExpenses.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No expenses</div>
        ) : (
          currentExpenses.map((expense) => (
            <div key={expense.id} className="p-4 shadow-[0_1px_3px_rgba(148,163,184,0.12)] hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(new Date(expense.date))}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 ml-2">{formatCurrency(expense.amount)}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {expense.category}
                </span>
              </div>
              <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        aria-label={`Edit ${expense.description}`}
                        title="Edit expense"
                        disabled={pendingExpenseIds.has(expense.id as number)}
className="inline-flex size-10 items-center justify-center border-0 bg-transparent p-0 text-blue-600 transition-colors hover:bg-transparent hover:text-blue-700 hover:drop-shadow-[0_1px_2px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        aria-label={`Delete ${expense.description}`}
                        title="Delete expense"
                        disabled={pendingExpenseIds.has(expense.id as number)}
className="inline-flex size-10 items-center justify-center border-0 bg-transparent p-0 text-red-600 transition-colors hover:bg-transparent hover:text-red-700 hover:drop-shadow-[0_1px_2px_rgba(220,38,38,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {expenses.length > 0 && totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-center text-sm text-slate-600 sm:text-left">
            Showing {firstVisibleExpense}-{lastVisibleExpense} of {expenses.length} expenses
            <span className="ml-2 text-slate-500">(5 per page)</span>
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <span className="whitespace-nowrap text-sm font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) setCurrentPage((page) => page - 1);
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive onClick={(event) => event.preventDefault()}>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((page) => page + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <div className="w-full">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl">Edit Expense</DialogTitle>
              <DialogDescription>
                Update the expense details below.
              </DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <ExpenseForm
                initialData={{
                  amount: editingExpense.amount.toString(),
                  description: editingExpense.description,
                  category: editingExpense.category,
                  date: editingExpense.date,
                }}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditModalOpen(false)}
                submitLabel="Update Expense"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-6">
              <div className="flex size-6 items-center justify-center flex-shrink-0 text-red-600">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Delete this expense?</h2>
                <p className="mt-1 text-sm text-slate-600">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}