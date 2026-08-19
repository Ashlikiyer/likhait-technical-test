/**
 * Form component for adding/editing expenses
 */

import { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { fetchCategories } from "../services/api";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { Button } from "./ui/button";
import { Field, FieldGroup } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CategorySelect } from "./ui/category-select";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<string[]>([]);

  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({
      initialData,
      onSubmit,
    });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchCategories();
        setCategories(categoryData.map((category) => category.name).sort());
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <Field>
          <Label htmlFor="expense-amount">Amount</Label>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            required
          />
          {errors.amount && (
            <p className="text-sm text-destructive" role="alert">
              {errors.amount}
            </p>
          )}
        </Field>

        <Field>
          <Label htmlFor="expense-date">Date</Label>
          <Input
            id="expense-date"
            type="date"
            max={today}
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            aria-invalid={Boolean(errors.date)}
            className="bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
            required
          />
          {errors.date && (
            <p className="text-sm text-destructive" role="alert">
              {errors.date}
            </p>
          )}
        </Field>

        <Field className="sm:col-span-2">
          <Label htmlFor="expense-description">Description</Label>
          <Input
            id="expense-description"
            type="text"
            placeholder="What was this expense for?"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            aria-invalid={Boolean(errors.description)}
            required
          />
          {errors.description && (
            <p className="text-sm text-destructive" role="alert">
              {errors.description}
            </p>
          )}
        </Field>

        <Field className="sm:col-span-2">
          <Label htmlFor="expense-category">Category</Label>
          <CategorySelect
            id="expense-category"
            value={formData.category}
            options={categories}
            onChange={(value) => handleChange("category", value)}
            aria-invalid={Boolean(errors.category)}
            required
          />
          {errors.category && (
            <p className="text-sm text-destructive" role="alert">
              {errors.category}
            </p>
          )}
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}