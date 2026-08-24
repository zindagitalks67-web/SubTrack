export type LanguageCode = 'english' | 'mandarin' | 'hindi' | 'spanish' | 'arabic' | 'french' | 'bengali' | 'portuguese' | 'russian' | 'urdu' | 'hinglish';

export const translations = {
  english: {
    settings: "Settings", manageAccount: "Manage your account and preferences",
    fullName: "Full Name", currency: "Preferred Currency", language: "Preferred Language", saveChanges: "Save Changes",
    home: "Home", subs: "Subs", bills: "Bills", recurring: "Recurring", finance: "Finance", analytics: "Analytics", calendar: "Calendar", budget: "Budget", alerts: "Alerts", family: "Family",
    addSubscription: "Add Subscription", addBill: "Add Bill", addExpense: "Add Expense", addIncome: "Add Income", cancel: "Cancel",
    search: "Search", all: "All", active: "Active", upcoming: "Upcoming", shared: "Shared", hikes: "Price Hikes",
    noSubscriptions: "No subscriptions found", noBills: "No bills found", noTransactions: "No transactions found",
    edit: "Edit", delete: "Delete", save: "Save", monthly: "Monthly", yearly: "Yearly", weekly: "Weekly",
    totalExpenses: "Total Expenses", totalIncome: "Total Income", remaining: "Remaining", spent: "Spent", add: "Add", close: "Close",
    expenses: "Expenses", income: "Income"
  },
  // Baaki languages ka data yahan paste karo (jaise hindi, spanish, etc.)
  // Har object ke end mein expenses: "...", income: "..." add karo
};