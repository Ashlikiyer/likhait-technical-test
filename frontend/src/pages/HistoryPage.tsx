import React, { useState, useEffect } from "react";
import { getExpenses, createExpense, createCategory } from "../services/api";
import { useToast } from "../components/Toast";
import { Expense, ExpenseFormData } from "../types";
import { DateFilter } from "../components/DateFilter";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { COLORS } from "../constants/colors";

const HistoryPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryVersion, setCategoryVersion] = useState(0);

  // Get year and month from URL params, default to current date if not provided
  const getInitialYearMonth = () => {
    const params = new URLSearchParams(window.location.search);
    const currentDate = new Date();
    const yearParam = params.get("year");
    const monthParam = params.get("month");

    return {
      year: yearParam ? parseInt(yearParam) : currentDate.getFullYear(),
      month: monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1,
    };
  };

  const initial = getInitialYearMonth();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);

  // Update URL when year or month changes
  const updateURL = (year: number, month: number) => {
    const params = new URLSearchParams();
    params.set("year", year.toString());
    params.set("month", month.toString());
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newURL);
  };

  // Initialize URL params if not present
  useEffect(() => {
    updateURL(selectedYear, selectedMonth);
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getExpenses(selectedYear, selectedMonth);
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoadError("We couldn't load your expenses. Please try again.");
      showToast("Unable to load expenses.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    updateURL(year, selectedMonth);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    updateURL(selectedYear, month);
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    // Close the form immediately, but only show the row after the server
    // returns its real ID. This prevents editing a record that is not persisted.
    setIsModalOpen(false);
    showToast("Saving expense...", "success");

    try {
      const newExpense = await createExpense(data);

      // The returned record is persisted and can be edited immediately.
      setExpenses((prev) => [newExpense, ...prev]);
      showToast("Expense created successfully.", "success");
    } catch (error) {
      console.error("Error creating expense:", error);
      showToast("Failed to create expense. Please try again.", "error");
      throw error;
    }
  };

  const handleExpensesChanged = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
  };

  const handleAddCategory = async (name: string) => {
    try {
      await createCategory(name);
      setCategoryVersion((version) => version + 1);
      setIsCategoryModalOpen(false);
      showToast("Category created successfully.", "success");
    } catch (error) {
      console.error("Error creating category:", error);
      showToast("Failed to create category. It may already exist.", "error");
      throw error;
    }
  };

  const pageStyle: React.CSSProperties = {
    padding: "24px 32px",
    minHeight: "100%",
    background: "transparent",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    justifyContent: "space-between",
  };

  const leftHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: 700,
    color: COLORS.secondary.s10,
    margin: 0,
    flexShrink: 0,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={leftHeaderStyle}>
          <h1 style={titleStyle}>Expense History</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            Add Category
          </Button>
          <Button size="lg" onClick={() => setIsModalOpen(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      <DateFilter
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      <div>
        {loading ? (
          <div className="space-y-6" role="status" aria-label="Loading expenses">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-3 h-8 w-32" />
                </div>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:block">
              <div className="border-b border-slate-200 p-4">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((column) => (
                    <Skeleton key={column} className="h-4 w-20" />
                  ))}
                </div>
              </div>
              <div className="space-y-4 p-4">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="grid grid-cols-5 items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="ml-auto h-4 w-20" />
                    <Skeleton className="mx-auto h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:hidden">
              {[1, 2, 3].map((row) => (
                <div key={row} className="rounded-lg border border-slate-200 bg-white p-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-24" />
                  <Skeleton className="mt-3 h-6 w-24 rounded-full" />
                  <Skeleton className="mt-4 h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : loadError ? (
          <div
            role="alert"
            style={{
              marginTop: "32px",
              padding: "24px",
              color: COLORS.red.re07,
              background: COLORS.red.re02,
              border: `1px solid ${COLORS.red.re04}`,
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 16px", fontWeight: 600 }}>{loadError}</p>
            <Button variant="secondary" onClick={fetchExpenses}>
              Try again
            </Button>
          </div>
        ) : (
          <CalendarExpenseTable
            expenses={expenses}
            onExpenseUpdated={handleExpensesChanged}
          />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record an expense with its amount, category, description, and date.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            key={categoryVersion}
            onSubmit={handleAddExpense}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a category to keep your expenses organized.
            </DialogDescription>
          </DialogHeader>
          <AddCategoryForm
            onSubmit={handleAddCategory}
            onCancel={() => setIsCategoryModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;