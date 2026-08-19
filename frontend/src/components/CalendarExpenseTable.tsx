/**
 * Calendar expense table component - Modern Design
 */

import React, { useState } from "react";
import { Expense, ExpenseFormData } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";
import { Button, Modal, Pagination } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { deleteExpense, updateExpense } from "../services/api";
import { useToast } from "./Toast";

interface CalendarExpenseTableProps {
  expenses: Expense[];
  onExpenseUpdated: () => void;
}

const ITEMS_PER_PAGE = 10;

export function CalendarExpenseTable({
  expenses,
  onExpenseUpdated,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense.id);
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
      onExpenseUpdated();
      showToast("Expense deleted successfully.", "success");
    } catch (error) {
      console.error("Failed to delete expense:", error);
      showToast("Failed to delete expense. Please try again.", "error");
    }
  };

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, data);
      setIsEditModalOpen(false);
      setEditingExpense(null);
      onExpenseUpdated();
      showToast("Expense updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update expense:", error);
      showToast("Failed to update expense. Please try again.", "error");
      throw error;
    }
  };

  // Modern table styles
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "transparent",
  };

  const theadStyle: React.CSSProperties = {
    backgroundColor: "transparent",
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: COLORS.text.secondary,
    borderBottom: `2px solid ${COLORS.secondary.s03}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "16px",
    color: COLORS.text.primary,
    borderBottom: `1px solid ${COLORS.secondary.s02}`,
    fontSize: "14px",
  };

  const emptyContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "16px",
  };

  const emptyIconStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${COLORS.primary.p01} 0%, ${COLORS.primary.p02} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: COLORS.text.primary,
    margin: 0,
  };

  const emptySubtitleStyle: React.CSSProperties = {
    fontSize: "14px",
    color: COLORS.text.secondary,
    margin: 0,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  };

  const editButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: COLORS.primary.p01,
    color: COLORS.primary.p06,
    transition: "all 0.2s ease",
  };

  const deleteButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: COLORS.red.re02,
    color: COLORS.red.re07,
    transition: "all 0.2s ease",
  };

  const paginationContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: `1px solid ${COLORS.secondary.s02}`,
  };

  // Category badge style
  const categoryBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    background: COLORS.secondary.s01,
    fontSize: "13px",
    fontWeight: 500,
  };

  // Amount display style
  const amountStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "15px",
    color: COLORS.text.primary,
  };

  // Row hover effect
  const rowStyle: React.CSSProperties = {
    transition: "background-color 0.15s ease",
  };

  if (expenses.length === 0) {
    return (
      <div style={emptyContainerStyle}>
        <div style={emptyIconStyle}>📝</div>
        <h3 style={emptyTitleStyle}>No expenses yet</h3>
        <p style={emptySubtitleStyle}>
          Add your first expense to start tracking your spending
        </p>
      </div>
    );
  }

  return (
    <>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Amount</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map((expense) => (
            <tr
              key={expense.id}
              style={{
                ...rowStyle,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.secondary.s01;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <td style={tdStyle}>
                <span style={{ fontWeight: 500 }}>
                  {formatDate(new Date(expense.date))}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: COLORS.text.primary }}>
                  {expense.description}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={categoryBadgeStyle}>
                  <span>{getCategoryEmoji(expense.category)}</span>
                  <span>{expense.category}</span>
                </span>
              </td>
              <td style={{ ...tdStyle }}>
                <span style={amountStyle}>
                  {formatCurrency(expense.amount)}
                </span>
              </td>
              <td style={{ ...tdStyle }}>
                <div style={actionButtonsStyle}>
                  <button
                    style={editButtonStyle}
                    onClick={() => handleEdit(expense)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.primary.p02;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.primary.p01;
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(expense)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = COLORS.red.re04;
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = COLORS.red.re02;
                      e.currentTarget.style.color = COLORS.red.re07;
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={paginationContainerStyle}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category,
              date: formatDate(new Date(editingExpense.date)),
            }}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "20px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
              padding: "16px",
              background: COLORS.red.re02,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: COLORS.red.re04,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              ⚠
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: COLORS.red.re07 }}>
                {deletingExpense?.description}
              </p>
              <p style={{ margin: "4px 0 0", color: COLORS.text.secondary }}>
                {deletingExpense && formatCurrency(deletingExpense.amount)}
              </p>
            </div>
          </div>
          <p style={{ marginBottom: "24px", color: COLORS.text.secondary, lineHeight: 1.6 }}>
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Expense
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}