import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard, Wallet, Banknote, History, DollarSign } from "lucide-react";
import api from "../../utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
  cardNumber: z.string()
    .min(1, "رقم البطاقة مطلوب")
    .regex(/^\d{16}$/, "رقم البطاقة يجب أن يكون 16 رقمًا"), // Assuming 16-digit card number
  expirationDate: z.string()
    .min(1, "تاريخ انتهاء الصلاحية مطلوب")
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/, "صيغة تاريخ انتهاء الصلاحية غير صالحة (MM/YYYY)"),
});

// Zod schema for Deposit Funds form
const DepositSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "الرجاء إدخال مبلغ صحيح للإيداع.",
  }),
  paymentMethodId: z.string().min(1, "طريقة الدفع مطلوبة للإيداع."),
});

// Zod schema for Withdraw Funds form
const WithdrawalSchema = z.object({
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "الرجاء إدخال مبلغ صحيح للسحب.",
  }),
  paymentMethodId: z.string().min(1, "طريقة الدفع مطلوبة للسحب."),
});


export function ClientFinancials() {
  const dispatch = useDispatch();
  const { token, isLoading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { transactions, isLoading: transactionsLoading, error: transactionsError } = useSelector((state) => state.transactions);

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);
  const [withdrawalError, setWithdrawalError] = useState(null);

  // Add New Payment Method form state and methods
  const { control: addPaymentMethodControl, handleSubmit: handleAddPaymentMethodSubmit, register: addPaymentMethodRegister, formState: { errors: addPaymentMethodErrors, isSubmitting: isAddingPaymentMethod } , reset: resetAddPaymentMethodForm } = useForm({
    resolver: zodResolver(AddPaymentMethodSchema),
    defaultValues: {
      cardHolderName: "",
      cardType: "",
      cardNumber: "",
      expirationDate: "",
    },
  });

  // Deposit Funds form state and methods
  const { control: depositControl, handleSubmit: handleDepositSubmit, register: depositRegister, formState: { errors: depositErrors, isSubmitting: isDepositingFunds }, setValue: setDepositValue, watch: watchDeposit } = useForm({
    resolver: zodResolver(DepositSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: "",
    },
  });
  const selectedDepositPaymentMethod = watchDeposit("paymentMethodId");

  // Withdraw Funds form state and methods
  const { control: withdrawalControl, handleSubmit: handleWithdrawalSubmit, register: withdrawalRegister, formState: { errors: withdrawalErrors, isSubmitting: isWithdrawingFunds }, setValue: setWithdrawalValue, watch: watchWithdrawal } = useForm({
    resolver: zodResolver(WithdrawalSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: "",
    },
  });
  const selectedWithdrawalPaymentMethod = watchWithdrawal("paymentMethodId");


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
      setPayments(paymentsData.results.map(payment => ({
        id: payment.id,
        amount: `$${payment.amount}`,
        type: payment.payment_type,
        status: payment.status,
        date: new Date(payment.timestamp).toLocaleDateString("ar-EG"),
      })));

      // Fetch payment methods
      const paymentMethodsData = await api.get("/payments/paymentmethods/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(paymentMethodsData.results);
      if (paymentMethodsData.results.length > 0) {
        setDepositValue("paymentMethodId", String(paymentMethodsData.results[0].id));
        setWithdrawalValue("paymentMethodId", String(paymentMethodsData.results[0].id));
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


  useEffect(() => {
    fetchFinancialData();
    dispatch(getUserTransactions());
  }, [token, authLoading, dispatch]);

  const handleDeposit = async (data) => {
    dispatch(depositFunds({ amount: parseFloat(data.amount), payment_method_id: parseInt(data.paymentMethodId) }))
      .unwrap()
      .then(() => {
        setDepositValue("amount", "");
        fetchFinancialData(); // Refetch financial data after successful deposit
      })
      .catch((err) => {
        console.error("Deposit failed:", err);
      });
  };

  const handleWithdrawal = async (data) => {
    dispatch(withdrawFunds({ amount: parseFloat(data.amount), payment_method_id: parseInt(data.paymentMethodId) }))
      .unwrap()
      .then(() => {
        setWithdrawalValue("amount", "");
        setWithdrawalError(null); // Clear any previous withdrawal errors on success
        fetchFinancialData(); // Refetch financial data after successful withdrawal
      })
      .catch((err) => {
        console.error("Withdrawal failed:", err);
        if (err && err.amount && err.amount === "Insufficient available balance for withdrawal.") {
          setWithdrawalError("رصيدك المتاح غير كافٍ للسحب.");
        } else {
          setWithdrawalError(err.message || "فشل السحب.");
        }
      });
  };

  const onAddPaymentMethod = async (data) => {
    const lastFourDigits = data.cardNumber.slice(-4);

    try {
      await dispatch(addPaymentMethod({
        card_type: data.cardType,
        card_holder_name: data.cardHolderName,
        card_number: data.cardNumber,
        expiration_date: data.expirationDate,
        last_four_digits: lastFourDigits,
      })).unwrap();
      
      alert("تم إضافة طريقة الدفع بنجاح!");
      resetAddPaymentMethodForm();
      fetchFinancialData(); // Refresh payment methods after adding a new one
    } catch (err) {
      alert(err.message || "فشل في إضافة طريقة الدفع.");
      console.error("Add payment method failed:", err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      "completed": { variant: "default", className: "bg-green-100 text-green-800" },
      "pending": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "failed": { variant: "default", className: "bg-red-100 text-red-800" },
      "مكتملة": { variant: "default", className: "bg-green-100 text-green-800" },
      "معلقة": { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      "فاشلة": { variant: "default", className: "bg-red-100 text-red-800" },
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
    const config = variants[status] || { variant: "default", className: "bg-gray-100 text-gray-800" };
    return <Badge variant={config.variant} className={config.className}>{translatedStatus}</Badge>;
  };

  const getTransactionTypeBadge = (type) => {
    let translatedType = type;
    let colorClass = "bg-gray-100 text-gray-800";

    switch (type) {
      case "DEPOSIT": // Backend transaction types are typically uppercase
        translatedType = "إيداع";
        colorClass = "bg-green-100 text-green-800";
        break;
      case "WITHDRAWAL":
        translatedType = "سحب";
        colorClass = "bg-red-100 text-red-800";
        break;
      case "PAYMENT_SENT":
        translatedType = "دفع مرسل";
        colorClass = "bg-blue-100 text-blue-800";
        break;
      case "PAYMENT_RECEIVED":
        translatedType = "دفع مستلم";
        colorClass = "bg-purple-100 text-purple-800";
        break;
      case "REFUND":
        translatedType = "استرداد";
        colorClass = "bg-yellow-100 text-yellow-800";
        break;
      case "DISPUTE_FEE":
        translatedType = "رسوم نزاع";
        colorClass = "bg-orange-100 text-orange-800";
        break;
      default:
        translatedType = type;
        break;
    }

    return <Badge className={colorClass}>{translatedType}</Badge>;
  };

  if (authLoading || paymentsLoading || transactionsLoading) {
    return <div className="text-center p-8" dir="rtl">جاري تحميل البيانات المالية...</div>;
  }
  if (authError) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ في المصادقة: {authError}</div>;
  if (paymentsError) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ في سجل الدفعات: {paymentsError}</div>;
  if (transactionsError) return <div className="text-center p-8 text-red-500" dir="rtl">خطأ في سجل المعاملات: {transactionsError}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <DollarSign className="h-7 w-7" />
          <span>إدارة الأموال والمعاملات</span>
        </h1>
        <p className="text-muted-foreground">إدارة الإيداعات والسحوبات الخاصة بك وعرض سجل الدفعات والمعاملات.</p>
      </div>

      {/* Add New Payment Method Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>إضافة طريقة دفع جديدة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPaymentMethodSubmit(onAddPaymentMethod)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-holder-name" className="block text-sm font-medium text-gray-700 mb-1">
                اسم حامل البطاقة
              </Label>
              <Input
                id="card-holder-name"
                type="text"
                placeholder="اسم حامل البطاقة"
                {...addPaymentMethodRegister("cardHolderName")}
                className="w-full"
              />
              {addPaymentMethodErrors.cardHolderName && (
                <p className="text-red-500 text-sm mt-1">{addPaymentMethodErrors.cardHolderName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="card-type" className="block text-sm font-medium text-gray-700 mb-1">
                نوع البطاقة
              </Label>
              <Controller
                name="cardType"
                control={addPaymentMethodControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="card-type" className="w-full">
                      <SelectValue placeholder="اختر نوع البطاقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="MasterCard">MasterCard</SelectItem>
                      <SelectItem value="American Express">American Express</SelectItem>
                      <SelectItem value="Discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {addPaymentMethodErrors.cardType && (
                <p className="text-red-500 text-sm mt-1">{addPaymentMethodErrors.cardType.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                رقم البطاقة
              </Label>
              <Input
                id="card-number"
                type="text"
                placeholder="رقم البطاقة"
                {...addPaymentMethodRegister("cardNumber")}
                className="w-full"
                dir="ltr"
              />
              {addPaymentMethodErrors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{addPaymentMethodErrors.cardNumber.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ انتهاء الصلاحية (MM/YYYY)
              </Label>
              <Input
                id="expiration-date"
                type="text"
                placeholder="MM/YYYY"
                {...addPaymentMethodRegister("expirationDate")}
                className="w-full"
                dir="ltr"
              />
              {addPaymentMethodErrors.expirationDate && (
                <p className="text-red-500 text-sm mt-1">{addPaymentMethodErrors.expirationDate.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isAddingPaymentMethod} className="mt-4 col-span-full">
              {isAddingPaymentMethod ? "جاري الإضافة..." : "إضافة طريقة الدفع"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Deposit Funds Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>إيداع الأموال</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDepositSubmit(handleDeposit)} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grow">
              <Label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                المبلغ
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="أدخل مبلغ الإيداع"
                {...depositRegister("amount")}
                min="0.01"
                step="0.01"
                className="w-full mb-2"
                dir="ltr"
              />
              {depositErrors.amount && (
                <p className="text-red-500 text-sm mt-1">{depositErrors.amount.message}</p>
              )}

              <Label htmlFor="deposit-payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                طريقة الدفع
              </Label>
              <Controller
                name="paymentMethodId"
                control={depositControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="deposit-payment-method" className="w-full">
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
              {depositErrors.paymentMethodId && (
                <p className="text-red-500 text-sm mt-1">{depositErrors.paymentMethodId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isDepositingFunds || paymentMethods.length === 0}>
              {isDepositingFunds ? "جاري الإيداع..." : "إيداع"}
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
          <form onSubmit={handleWithdrawalSubmit(handleWithdrawal)} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grow">
              <Label htmlFor="withdrawal-amount" className="block text-sm font-medium text-gray-700 mb-1">
                المبلغ
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="أدخل مبلغ السحب"
                {...withdrawalRegister("amount")}
                min="0.01"
                step="0.01"
                className="w-full mb-2"
                dir="ltr"
              />
              {withdrawalErrors.amount && (
                <p className="text-red-500 text-sm mt-1">{withdrawalErrors.amount.message}</p>
              )}

              <Label htmlFor="withdrawal-payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                طريقة الدفع
              </Label>
              <Controller
                name="paymentMethodId"
                control={withdrawalControl}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="withdrawal-payment-method" className="w-full">
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
                <p className="text-red-500 text-sm mt-1">{withdrawalErrors.paymentMethodId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isWithdrawingFunds || paymentMethods.length === 0}>
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
                  <TableHead>طريقة الدفع</TableHead> {/* New column for Payment Method */}
                  <TableHead>العملة</TableHead> {/* New column for Currency */}
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ والوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                    <TableCell>{transaction.payment_method || 'N/A'}</TableCell> {/* Display payment method, or N/A if null */}
                    <TableCell>{transaction.currency}</TableCell> {/* Display currency */}
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{new Date(transaction.timestamp).toLocaleString("ar-EG")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
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
