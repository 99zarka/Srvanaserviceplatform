import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  CreditCard,
  Wallet,
  Banknote,
  History,
  DollarSign,
  Loader2,
} from "lucide-react";
import api from "../../utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"; // Import Select components
import { depositFunds, withdrawFunds } from "../../redux/authSlice";
import { getUserTransactions } from "../../redux/transactionSlice";
import { addPaymentMethod } from "../../redux/authSlice"; // Import addPaymentMethod

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "../ui/label"; // Import Label

// Zod schema for Add New Payment Method form
const AddPaymentMethodSchema = z.object({
  cardHolderName: z.string().min(1, "اسم حامل البطاقة مطلوب"),
  cardType: z.string().min(1, "نوع البطاقة مطلوب"),
  cardNumber: z
    .string()
    .min(1, "رقم البطاقة مطلوب")
    .regex(/^\d{16}$/, "رقم البطاقة يجب أن يكون 16 رقمًا"), // Assuming 16-digit card number
  expirationDate: z
    .string()
    .min(1, "تاريخ انتهاء الصلاحية مطلوب")
    .regex(
      /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
      "صيغة تاريخ انتهاء الصلاحية غير صالحة (MM/YYYY)"
    ),
});

// Zod schema for Deposit Funds form
// Zod schema for Deposit Funds form
const DepositSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "الرجاء إدخال مبلغ صحيح للإيداع.",
  }),
  paymentMethodId: z.string().optional(),
});

// Zod schema for Withdraw Funds form
const WithdrawalSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "الرجاء إدخال مبلغ صحيح للسحب.",
  }),
  paymentMethodId: z.string().min(1, "طريقة الدفع مطلوبة للسحب."),
});

import { useLocation } from "react-router-dom"; // Add useLocation

export function ClientFinancials() {
  const dispatch = useDispatch();
  const location = useLocation(); // Hook to get current URL containing query params
  // ... existing selectors ...
  const {
    token,
    isLoading: authLoading,
    error: authError,
  } = useSelector((state) => state.auth);
  const {
    transactions,
    pagination,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useSelector((state) => state.transactions);

  const [currentPage, setCurrentPage] = useState(1);

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);
  const [withdrawalError, setWithdrawalError] = useState(null);
  const [depositSuccessMessage, setDepositSuccessMessage] = useState(null); // Local state for deposit success feedback
  const [depositMethod, setDepositMethod] = useState("new"); // "new" or "saved"
  const [pollingTransactionId, setPollingTransactionId] = useState(null); // Keep for backend tracking if needed, or remove if unused. Let's keep it to minimize diffs, but removing usage below.

  // ... form states ...
  // ... form states ...
  // ... form states ...
  const {
    control: depositControl,
    handleSubmit: handleDepositSubmit,
    register: depositRegister,
    formState: { errors: depositErrors, isSubmitting: isDepositingFunds },
    reset: resetDepositForm,
    setValue: setDepositValue,
  } = useForm({
    resolver: zodResolver(DepositSchema),
    defaultValues: {
      amount: "",
    },
  });

  const {
    control: withdrawalControl,
    handleSubmit: handleWithdrawalSubmit,
    register: withdrawalRegister,
    formState: { errors: withdrawalErrors, isSubmitting: isWithdrawingFunds },
    reset: resetWithdrawalForm,
    setValue: setWithdrawalValue,
  } = useForm({
    resolver: zodResolver(WithdrawalSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: "",
    },
  });

  // Removed manual payment method form states

  const [paymentMethods, setPaymentMethods] = useState([]);

  // Function to fetch all financial data including payment methods and transactions
  const fetchFinancialData = async () => {
    if (!token) {
      setPaymentsError("المستخدم غير مصادق عليه.");
      setPaymentsLoading(false);
      return;
    }
    try {
      setPaymentsLoading(true);
      // Fetch payments
      const paymentsData = await api.get("/payments/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(
        paymentsData.results.map((payment) => ({
          id: payment.id,
          amount: `$${payment.amount}`,
          type: payment.payment_type,
          status: payment.status,
          date: new Date(payment.timestamp).toLocaleDateString("ar-EG"),
        }))
      );

      // Fetch payment methods
      const paymentMethodsData = await api.get("/payments/paymentmethods/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(paymentMethodsData.results);
      if (paymentMethodsData.results.length > 0) {
        setDepositValue(
          "paymentMethodId",
          String(paymentMethodsData.results[0].id)
        );
        setWithdrawalValue(
          "paymentMethodId",
          String(paymentMethodsData.results[0].id)
        );
      } else {
        setDepositValue("paymentMethodId", "");
        setWithdrawalValue("paymentMethodId", "");
      }
    } catch (err) {
      setPaymentsError(err.message || "فشل في جلب البيانات المالية.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Effect to handle Payment Callback (Redirect from Paymob)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get("success");
    const pending = queryParams.get("pending");
    const id = queryParams.get("id"); // Transaction ID

    if (success === "true" && pending === "false" && id) {
      setDepositSuccessMessage(
        `تمت عملية الإيداع بنجاح! رقم المعاملة: ${id}. جاري تحديث الرصيد...`
      );

      // Optional: Clean URL params to avoid re-triggering on refresh
      // window.history.replaceState({}, document.title, window.location.pathname);

      // Delay fetching data to allow Webhook to process the transaction in background
      setTimeout(() => {
        fetchFinancialData();
        fetchFinancialData();
        dispatch(getUserTransactions(currentPage));
        // Consider dispatching fetchUserProfile too if not handled inside fetchFinancialData flow
      }, 3000);
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    fetchFinancialData();
    dispatch(getUserTransactions(currentPage));
  }, [token, authLoading, dispatch, currentPage]);

  const handleDeposit = async (data) => {
    try {
      // Dispatch depositFunds with just the amount
      const resultAction = await dispatch(
        depositFunds({ amount: parseFloat(data.amount) })
      );

      // Unwrap the result to handle success/failure
      const response = await unwrapResult(resultAction); // Need to import unwrapResult or use .unwrap()

      // Since unwrap() is available on the returned promise from dispatch, we use that
      // However, above I used await dispatch(...), so resultAction is the action object.
      // Correct pattern: dispatch(...).unwrap().then(...) OR const res = await dispatch(...).unwrap()
    } catch (err) {
      console.error("Deposit init failed", err);
    }
  };

  // 1. Background Polling Effect (Data Fetching)
  useEffect(() => {
    let intervalId;
    if (pollingTransactionId) {
      intervalId = setInterval(() => {
        // Just fetch new data
        // Usually new transactions are on Page 1 (sorted by -timestamp).
        // So we should check Page 1.
        dispatch(getUserTransactions(1));
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingTransactionId, dispatch]);

  // 2. Reactive Success Effect (Data Watching)
  useEffect(() => {
    if (pollingTransactionId && transactions.length > 0) {
      const targetTx = transactions.find(
        (t) =>
          String(t.id) === String(pollingTransactionId) ||
          String(t.external_id) === String(pollingTransactionId)
      );

      if (targetTx) {
        if (
          targetTx.status === "completed" ||
          targetTx.status === "COMPLETED"
        ) {
          setPollingTransactionId(null);
          setDepositSuccessMessage(`تمت عملية الإيداع بنجاح!`);
          fetchFinancialData();
          // Stop any local processing state if we added it back
        } else if (
          targetTx.status === "failed" ||
          targetTx.status === "FAILED"
        ) {
          setPollingTransactionId(null);
          alert("فشلت عملية الدفع.");
        }
      }
    }
  }, [transactions, pollingTransactionId, fetchFinancialData]);

  // Correct implementation of handleDeposit
  // Correct implementation of handleDeposit
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onDepositSubmit = async (data) => {
    // FORCE NEW CARD FLOW: Always send null paymentMethodId
    const paymentMethodId = null;

    setDepositSuccessMessage(null); // Clear previous messages
    setIsRedirecting(true); // Start processing

    try {
      const result = await dispatch(
        depositFunds({
          amount: parseFloat(data.amount),
          payment_method_id: paymentMethodId,
        })
      ).unwrap();

      // Handle successful response (Should always be iframe_url for New Card)
      if (result.iframe_url) {
        // Redirect user to Paymob Iframe in NEW TAB
        window.open(result.iframe_url, "_blank");

        // Start polling for this transaction ID
        const txId = result.transaction_id || result.order_id;
        if (txId) {
          setPollingTransactionId(txId);
        }

        setTimeout(() => setIsRedirecting(false), 2000);
      } else {
        // Fallback for unexpected success without URL
        if (result.success) {
          setDepositSuccessMessage("تم الإيداع بنجاح!");
          resetDepositForm();
          fetchFinancialData();
          dispatch(getUserTransactions(currentPage));
          setIsRedirecting(false);
        } else {
          console.error("Unknown response from deposit API", result);
          alert("حدث خطأ أثناء تهيئة الدفع.");
          setIsRedirecting(false);
        }
      }
    } catch (err) {
      console.error("Deposit failed:", err);
      // Clean up error message by removing 'Error: ' prefix if present
      const msg =
        typeof err === "string" ? err : err.message || "فشل في عملية الإيداع.";
      alert(msg);
      setIsRedirecting(false);
    }
  };

  const handleWithdrawal = async (data) => {
    dispatch(
      withdrawFunds({
        amount: parseFloat(data.amount),
        payment_method_id: parseInt(data.paymentMethodId),
      })
    )
      .unwrap()
      .then(() => {
        setWithdrawalValue("amount", "");
        setWithdrawalError(null); // Clear any previous withdrawal errors on success
        fetchFinancialData(); // Refetch financial data after successful withdrawal
      })
      .catch((err) => {
        console.error("Withdrawal failed:", err);
        if (
          err &&
          err.amount &&
          err.amount === "Insufficient available balance for withdrawal."
        ) {
          setWithdrawalError("رصيدك المتاح غير كافٍ للسحب.");
        } else {
          setWithdrawalError(err.message || "فشل السحب.");
        }
      });
  };

  // Removed onAddPaymentMethod handler

  const getStatusBadge = (status) => {
    const variants = {
      completed: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      pending: {
        variant: "default",
        className: "bg-yellow-100 text-yellow-800",
      },
      failed: { variant: "default", className: "bg-red-100 text-red-800" },
      مكتملة: { variant: "default", className: "bg-green-100 text-green-800" },
      معلقة: { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      فاشلة: { variant: "default", className: "bg-red-100 text-red-800" },
    };
    let translatedStatus = status;
    switch (status) {
      case "completed":
        translatedStatus = "مكتملة";
        break;
      case "pending":
        translatedStatus = "معلقة";
        break;
      case "failed":
        translatedStatus = "فاشلة";
        break;
    }
    const config = variants[status] || {
      variant: "default",
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant={config.variant} className={config.className}>
        {translatedStatus}
      </Badge>
    );
  };

  const getTransactionTypeBadge = (type) => {
    let translatedType = type;
    let colorClass = "bg-gray-100 text-gray-800";

    switch (type) {
      case "DEPOSIT":
        translatedType = "إيداع";
        colorClass = "bg-green-100 text-green-800";
        break;
      case "WITHDRAWAL":
        translatedType = "سحب";
        colorClass = "bg-red-100 text-red-800";
        break;
      case "ESCROW_HOLD":
        translatedType = "معلق في الضمان";
        colorClass = "bg-blue-100 text-blue-800";
        break;
      case "ESCROW_RELEASE":
        translatedType = "إفراج الضمان";
        colorClass = "bg-purple-100 text-purple-800";
        break;
      case "CANCEL_REFUND":
        translatedType = "استرداد إلغاء";
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "DISPUTE_PAYOUT":
        translatedType = "دفع نزاع";
        colorClass = "bg-orange-100 text-orange-800";
        break;
      case "DISPUTE_REFUND":
        translatedType = "استرداد نزاع";
        colorClass = "bg-red-100 text-red-800";
        break;
      case "FEE":
        translatedType = "رسوم";
        colorClass = "bg-gray-100 text-gray-800";
        break;
      default:
        translatedType = type;
        break;
    }

    return <Badge className={colorClass}>{translatedType}</Badge>;
  };

  if (authLoading || paymentsLoading || transactionsLoading) {
    return (
      <div className="text-center p-8" dir="rtl">
        جاري تحميل البيانات المالية...
      </div>
    );
  }
  if (authError)
    return (
      <div className="text-center p-8 text-red-500" dir="rtl">
        خطأ في المصادقة: {authError}
      </div>
    );
  if (paymentsError)
    return (
      <div className="text-center p-8 text-red-500" dir="rtl">
        خطأ في سجل الدفعات: {paymentsError}
      </div>
    );
  if (transactionsError)
    return (
      <div className="text-center p-8 text-red-500" dir="rtl">
        خطأ في سجل المعاملات: {transactionsError}
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      {depositSuccessMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold ml-2">نجاح!</strong>
          <span className="block sm:inline">{depositSuccessMessage}</span>
          <span
            className="absolute top-0 bottom-0 left-0 px-4 py-3"
            onClick={() => setDepositSuccessMessage(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>إدارة الأموال والمعاملات</span>
        </h1>
        <p className="text-muted-foreground">
          إدارة الإيداعات والسحوبات الخاصة بك وعرض سجل الدفعات والمعاملات.
        </p>
      </div>

      {/* Manual Add Payment Method Card REMOVED */}

      {/* Loading Overlay REMOVED */}

      {/* Deposit Funds Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>إيداع الأموال</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleDepositSubmit(onDepositSubmit)}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="grow">
              <Label
                htmlFor="deposit-amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                المبلغ
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="أدخل مبلغ الإيداع"
                {...depositRegister("amount")}
                min="10.00" // Paymob minimum is usually around 10 EGP
                step="1"
                className="w-full mb-2"
                dir="ltr"
              />
              {depositErrors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {depositErrors.amount.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isDepositingFunds || isRedirecting}
              className="w-full md:w-auto"
            >
              {isDepositingFunds || isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>جاري تحويلك للدفع...</span>
                </>
              ) : (
                "الدفع "
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdraw Funds Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Banknote className="h-5 w-5" />
            <span>سحب الأموال</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleWithdrawalSubmit(handleWithdrawal)}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="grow">
              <Label
                htmlFor="withdrawal-amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                المبلغ
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="أدخل مبلغ السحب"
                {...withdrawalRegister("amount")}
                min="0.01"
                step="1"
                className="w-full mb-2"
                dir="ltr"
              />
              {withdrawalErrors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {withdrawalErrors.amount.message}
                </p>
              )}

              <Label
                htmlFor="withdrawal-payment-method"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                طريقة الدفع
              </Label>
              <Controller
                name="paymentMethodId"
                control={withdrawalControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="withdrawal-payment-method"
                      className="w-full"
                    >
                      <SelectValue placeholder="اختر طريقة دفع" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={String(method.id)}>
                            {method.card_type} (****{method.last_four_digits})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-methods" disabled>
                          لا توجد طرق دفع متاحة
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {withdrawalErrors.paymentMethodId && (
                <p className="text-red-500 text-sm mt-1">
                  {withdrawalErrors.paymentMethodId.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isWithdrawingFunds || paymentMethods.length === 0}
            >
              {isWithdrawingFunds ? "جاري السحب..." : "سحب"}
            </Button>
          </form>
          {withdrawalError && (
            <p className="text-red-500 text-sm mt-2">{withdrawalError}</p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>سجل المعاملات</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد معاملات حاليًا.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  {/* New column for Payment Method */}
                  <TableHead>العملة</TableHead> {/* New column for Currency */}
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ والوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(transaction.transaction_type)}
                    </TableCell>
                    <TableCell>{transaction.payment_method || "N/A"}</TableCell>{" "}
                    {/* Display payment method, or N/A if null */}
                    <TableCell>{transaction.currency}</TableCell>{" "}
                    {/* Display currency */}
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleString("ar-EG")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!pagination?.previous}
          >
            السابق
          </Button>
          <span className="text-sm text-gray-500">صفحة {currentPage}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!pagination?.next}
          >
            التالي
          </Button>
        </div>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>سجل المدفوعات</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد دفعات مسجلة حتى الآن.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
