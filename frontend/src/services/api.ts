/**
 * API service for communicating with the backend
 */

import { Expense, ExpenseFormData } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

type Category = { id: number; name: string };

let categoriesCache: Category[] | null = null;
let categoriesRequest: Promise<Category[]> | null = null;

// Expense cache for faster initial loads (stale-while-revalidate)
interface ExpenseCacheEntry {
  data: Expense[];
  timestamp: number;
}
const expenseCache = new Map<string, ExpenseCacheEntry>();
const CACHE_TTL = 5000; // 5 seconds

/**
 * Fetch all expenses
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch expenses for a specific year and month with caching
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const cacheKey = `${year}-${month}`;
  const cached = expenseCache.get(cacheKey);
  const now = Date.now();

  // Return cached data immediately if fresh
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    // Return stale cache on error if available
    if (cached) {
      return cached.data;
    }
    throw new Error("Failed to fetch expenses");
  }
  
  const data = await response.json();
  expenseCache.set(cacheKey, { data, timestamp: now });
  return data;
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  if (categoriesCache) {
    return categoriesCache;
  }

  if (!categoriesRequest) {
    categoriesRequest = fetch(`${API_BASE_URL}/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json() as Promise<Category[]>;
      })
      .then((categories) => {
        categoriesCache = categories;
        return categories;
      })
      .finally(() => {
        categoriesRequest = null;
      });
  }

  return categoriesRequest;
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  // Convert category name to category_id
  const categories = await fetchCategories();
  const category = categories.find((c) => c.name === data.category);

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: category?.id,
    date: data.date,
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  // Invalidate expense cache
  expenseCache.clear();
  return response.json();
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  // Build expense data with category_id conversion
  const expenseData: Record<string, unknown> = {
    description: data.description,
    amount: data.amount,
    date: data.date,
  };
  
  // Convert category name to category_id if category is provided
  if (data.category) {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.name === data.category);
    
    console.log("Update expense - Category lookup:", {
      categoryName: data.category,
      foundCategory: category,
      allCategories: categories
    });
    
    if (!category) {
      throw new Error(`Category '${data.category}' not found`);
    }
    
    expenseData.category_id = category.id;
  }
  
  console.log("Update expense - Sending payload:", { id, expenseData });

  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  // Invalidate expense cache
  expenseCache.clear();
  return response.json();
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }

  // Invalidate expense cache
  expenseCache.clear();
}

/**
 * Create a new category
 */
export async function createCategory(name: string): Promise<{ id: number; name: string; icon?: string }> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: { name } }),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  const category = await response.json();
  categoriesCache = null;
  return category;
}
