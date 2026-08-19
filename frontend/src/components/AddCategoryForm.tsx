/**
 * Add Category Form Component
 * Modal form for creating new expense categories
 */

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldGroup } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AddCategoryFormProps {
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(categoryName.trim());
      setCategoryName("");
    } catch (err) {
      setError("Failed to create category. It may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="categoryName">Category name</Label>
          <Input
            id="categoryName"
            type="text"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. Groceries"
            disabled={isSubmitting}
            autoFocus
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
      </div>
    </form>
  );
};