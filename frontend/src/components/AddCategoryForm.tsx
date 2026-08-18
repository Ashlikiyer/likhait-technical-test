/**
 * Add Category Form Component
 * Modal form for creating new expense categories
 */

import React, { useState } from "react";
import { COLORS } from "../constants/colors";

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

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minWidth: "300px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: `1px solid ${COLORS.secondary.s03}`,
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: COLORS.primary.p06,
    color: "white",
    opacity: isSubmitting ? 0.7 : 1,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    background: COLORS.secondary.s02,
    color: COLORS.secondary.s10,
  };

  const errorStyle: React.CSSProperties = {
    color: COLORS.danger,
    fontSize: "14px",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div>
        <label
          htmlFor="categoryName"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: COLORS.secondary.s10,
          }}
        >
          Category Name
        </label>
        <input
          id="categoryName"
          type="text"
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter category name"
          style={inputStyle}
          disabled={isSubmitting}
          autoFocus
        />
        {error && <p style={errorStyle}>{error}</p>}
      </div>

      <div style={buttonContainerStyle}>
        <button
          type="button"
          onClick={onCancel}
          style={secondaryButtonStyle}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </button>
      </div>
    </form>
  );
};