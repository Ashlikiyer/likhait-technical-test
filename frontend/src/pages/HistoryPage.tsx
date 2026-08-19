/**
 * History Page - Modern Redesigned UI
 * Main expense tracking dashboard with enhanced visual design
 */

import React, { useState, useEffect } from "react";
import { getExpenses, createExpense, createCategory } from "../services/api";
import { useToast } from "../components/Toast";
import { Expense, ExpenseFormData } from "../types";
import YearNavigation from "../components/YearNavigation";
import { MonthNavigation } from "../components/MonthNavigation";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { CalendarExpenseTable } from "../components/CalendarExpenseTable";
import { ExpenseForm } from "../components/ExpenseForm";
import { AddCategoryForm } from "../components/AddCategoryForm";
import { Modal, Button } from "../vibes";
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
    try {
      await createExpense(data);
      setIsModalOpen(false);
      await fetchExpenses();
      showToast("Expense created successfully.", "success");
    } catch (error) {
      console.error("Error creating expense:", error);
      showToast("Failed to create expense. Please try again.", "error");
      throw error;
    }
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

  // Calculate category breakdown
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const category = expense.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 };
      }
      acc[category].amount += Number(expense.amount);
      acc[category].count += 1;
      return acc;
    },
    {} as Record<string, { category: string; amount: number; count: number }>,
  );

  const categories = Object.values(categoryData).sort(
    (a, b) => b.amount - a.amount,
  );
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  // Modern page layout styles
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${COLORS.secondary.s01} 0%, #f0f4f8 100%)`,
    padding: 0,
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "32px 48px",
  };

  // Modern header with gradient background
  const heroStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${COLORS.primary.p06} 0%, ${COLORS.primary.p08} 100%)`,
    borderRadius: "24px",
    padding: "40px 48px",
    marginBottom: "32px",
    boxShadow: "0 20px 60px rgba(50, 100, 220, 0.25)",
    position: "relative",
    overflow: "hidden",
  };

  const heroDecorStyle: React.CSSProperties = {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "400px",
    height: "400px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "50%",
    pointerEvents: "none",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  };

  const titleSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "36px",
    fontWeight: 700,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.85)",
    margin: 0,
    fontWeight: 400,
  };

  const heroActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: 600,
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ffffff",
    color: COLORS.primary.p06,
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
    transition: "all 0.2s ease",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: 600,
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
  };

  // Navigation section
  const navContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "16px 24px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
  };

  const yearNavWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const monthNavWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  // Content sections
  const contentGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
    alignItems: "start",
  };

  const sidebarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const mainContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  // Card styles
  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
    border: `1px solid ${COLORS.secondary.s02}`,
    overflow: "hidden",
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: "20px 24px",
    borderBottom: `1px solid ${COLORS.secondary.s02}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: COLORS.text.primary,
    margin: 0,
  };

  const cardBodyStyle: React.CSSProperties = {
    padding: "24px",
  };

  // Loading state
  const loadingContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 40px",
    gap: "20px",
  };

  const spinnerStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    border: `4px solid ${COLORS.secondary.s03}`,
    borderTopColor: COLORS.primary.p06,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  };

  const loadingTextStyle: React.CSSProperties = {
    fontSize: "16px",
    color: COLORS.text.secondary,
    margin: 0,
  };

  // Error state
  const errorContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    gap: "16px",
    textAlign: "center",
  };

  const errorIconStyle: React.CSSProperties = {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: COLORS.red.re02,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "8px",
  };

  const errorTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: COLORS.red.re07,
    margin: 0,
  };

  const errorMessageStyle: React.CSSProperties = {
    fontSize: "15px",
    color: COLORS.text.secondary,
    margin: 0,
  };

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={heroDecorStyle} />
          <div style={{ ...heroDecorStyle, top: "60%", right: "60%", width: "300px", height: "300px" }} />
          <div style={headerStyle}>
            <div style={titleSectionStyle}>
              <h1 style={titleStyle}>Expense Tracker</h1>
              <p style={subtitleStyle}>
                Track and manage your expenses with ease
              </p>
            </div>
            <div style={heroActionsStyle}>
              <button
                style={secondaryButtonStyle}
                onClick={() => setIsCategoryModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                }}
              >
                + Category
              </button>
              <button
                style={primaryButtonStyle}
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.15)";
                }}
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={navContainerStyle}>
          <div style={yearNavWrapperStyle}>
            <YearNavigation
              currentYear={selectedYear}
              onYearChange={handleYearChange}
            />
          </div>
          <div style={monthNavWrapperStyle}>
            <MonthNavigation
              currentMonth={selectedMonth}
              currentYear={selectedYear}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div style={{ ...cardStyle, ...loadingContainerStyle }} role="status">
            <div style={spinnerStyle} />
            <p style={loadingTextStyle}>Loading your expenses...</p>
          </div>
        ) : loadError ? (
          <div style={{ ...cardStyle, ...errorContainerStyle }} role="alert">
            <div style={errorIconStyle}>⚠</div>
            <p style={errorTitleStyle}>Unable to Load</p>
            <p style={errorMessageStyle}>{loadError}</p>
            <Button variant="primary" onClick={fetchExpenses} style={{ marginTop: "16px" }}>
              Try Again
            </Button>
          </div>
        ) : (
          <div style={contentGridStyle}>
            {/* Sidebar - Category Breakdown */}
            <div style={sidebarStyle}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h2 style={cardTitleStyle}>Spending by Category</h2>
                </div>
                <div style={cardBodyStyle}>
                  <CategoryBreakdown
                    categories={categories}
                    total={total}
                    totalCount={totalCount}
                  />
                </div>
              </div>
            </div>

            {/* Main Content - Expense Table */}
            <div style={mainContentStyle}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h2 style={cardTitleStyle}>
                    {monthNames[selectedMonth - 1]} {selectedYear} Expenses
                  </h2>
                  <span style={{
                    fontSize: "14px",
                    color: COLORS.text.secondary,
                    background: COLORS.secondary.s01,
                    padding: "6px 12px",
                    borderRadius: "20px",
                  }}>
                    {totalCount} transactions
                  </span>
                </div>
                <div style={cardBodyStyle}>
                  <CalendarExpenseTable
                    expenses={expenses}
                    onExpenseUpdated={fetchExpenses}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Expense"
        >
          <ExpenseForm
            key={categoryVersion}
            onSubmit={handleAddExpense}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Add New Category"
        >
          <AddCategoryForm
            onSubmit={handleAddCategory}
            onCancel={() => setIsCategoryModalOpen(false)}
          />
        </Modal>
      </div>

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;