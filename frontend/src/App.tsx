import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/infrastructure/theme-provider";
import { AuthProvider } from "@/domain/hooks/use-auth";
import AuthGuard from "@/ui/components/shared/AuthGuard";
import DashboardLayout from "@/ui/layouts/DashboardLayout";
import DashboardPage from "@/ui/pages/DashboardPage";
import LoginPage from "@/ui/pages/LoginPage";
import ProductListPage from "@/ui/pages/products/ProductListPage";
import ProductFormPage from "@/ui/pages/products/ProductFormPage";
import ProductDetailPage from "@/ui/pages/products/ProductDetailPage";
import CategoryListPage from "@/ui/pages/categories/CategoryListPage";
import StockMovementListPage from "@/ui/pages/inventory/StockMovementListPage";
import CustomerListPage from "@/ui/pages/customers/CustomerListPage";
import CustomerFormPage from "@/ui/pages/customers/CustomerFormPage";
import CustomerDetailPage from "@/ui/pages/customers/CustomerDetailPage";
import SupplierListPage from "@/ui/pages/suppliers/SupplierListPage";
import SupplierFormPage from "@/ui/pages/suppliers/SupplierFormPage";
import SupplierDetailPage from "@/ui/pages/suppliers/SupplierDetailPage";
import EmployeeListPage from "@/ui/pages/employees/EmployeeListPage";
import EmployeeFormPage from "@/ui/pages/employees/EmployeeFormPage";
import EmployeeDetailPage from "@/ui/pages/employees/EmployeeDetailPage";
import AttendancePage from "@/ui/pages/employees/AttendancePage";
import SalesListPage from "@/ui/pages/sales/SalesListPage";
import SaleDetailPage from "@/ui/pages/sales/SaleDetailPage";
import POSPage from "@/ui/pages/sales/POSPage";
import QuotationListPage from "@/ui/pages/quotations/QuotationListPage";
import QuotationFormPage from "@/ui/pages/quotations/QuotationFormPage";
import QuotationDetailPage from "@/ui/pages/quotations/QuotationDetailPage";
import PurchaseOrderListPage from "@/ui/pages/purchases/PurchaseOrderListPage";
import PurchaseOrderFormPage from "@/ui/pages/purchases/PurchaseOrderFormPage";
import PurchaseOrderDetailPage from "@/ui/pages/purchases/PurchaseOrderDetailPage";
import PurchaseReturnListPage from "@/ui/pages/purchases/PurchaseReturnListPage";
import PaymentListPage from "@/ui/pages/payments/PaymentListPage";
import PaymentFormPage from "@/ui/pages/payments/PaymentFormPage";
import ExpenseListPage from "@/ui/pages/expenses/ExpenseListPage";
import ExpenseFormPage from "@/ui/pages/expenses/ExpenseFormPage";
import ReportsPage from "@/ui/pages/reports/ReportsPage";
import SettingsPage from "@/ui/pages/settings/SettingsPage";
import AccountListPage from "@/ui/pages/accounting/AccountListPage";
import JournalEntryListPage from "@/ui/pages/accounting/JournalEntryListPage";
import JournalEntryFormPage from "@/ui/pages/accounting/JournalEntryFormPage";
import FinancialSummaryPage from "@/ui/pages/accounting/FinancialSummaryPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="esms-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <DashboardLayout />
                </AuthGuard>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="categories" element={<CategoryListPage />} />
              <Route path="inventory" element={<StockMovementListPage />} />
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/new" element={<CustomerFormPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="suppliers" element={<SupplierListPage />} />
              <Route path="suppliers/new" element={<SupplierFormPage />} />
              <Route path="suppliers/:id" element={<SupplierDetailPage />} />
              <Route path="suppliers/:id/edit" element={<SupplierFormPage />} />
              <Route path="employees" element={<EmployeeListPage />} />
              <Route path="employees/new" element={<EmployeeFormPage />} />
              <Route path="employees/:id" element={<EmployeeDetailPage />} />
              <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
              <Route path="employees/attendance" element={<AttendancePage />} />
              <Route path="purchases" element={<Outlet />}>
                <Route index element={<PurchaseOrderListPage />} />
                <Route path="new" element={<PurchaseOrderFormPage />} />
                <Route path=":id" element={<PurchaseOrderDetailPage />} />
                <Route path=":id/edit" element={<PurchaseOrderFormPage />} />
                <Route path="returns" element={<PurchaseReturnListPage />} />
              </Route>
              <Route path="sales" element={<Outlet />}>
                <Route index element={<SalesListPage />} />
                <Route path="pos" element={<POSPage />} />
                <Route path=":id" element={<SaleDetailPage />} />
                <Route path="quotations" element={<Outlet />}>
                  <Route index element={<QuotationListPage />} />
                  <Route path="new" element={<QuotationFormPage />} />
                  <Route path=":id" element={<QuotationDetailPage />} />
                  <Route path=":id/edit" element={<QuotationFormPage />} />
                </Route>
              </Route>
              <Route path="payments" element={<Outlet />}>
                <Route index element={<PaymentListPage />} />
                <Route path="new" element={<PaymentFormPage />} />
              </Route>
              <Route path="expenses" element={<Outlet />}>
                <Route index element={<ExpenseListPage />} />
                <Route path="new" element={<ExpenseFormPage />} />
              </Route>
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="accounting" element={<Outlet />}>
                <Route index element={<FinancialSummaryPage />} />
                <Route path="accounts" element={<AccountListPage />} />
                <Route path="journal" element={<JournalEntryListPage />} />
                <Route path="journal/new" element={<JournalEntryFormPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
