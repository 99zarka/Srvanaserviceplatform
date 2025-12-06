import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUserBalances,
  transferPendingToAvailable,
  clearPaymentError,
  clearPaymentSuccessMessage
} from '../../redux/paymentSlice';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

const BalanceDisplayAndTransfer = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    userBalances,
    loading: paymentLoading,
    error: paymentError,
    successMessage: paymentSuccessMessage
  } = useSelector((state) => state.payments);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // State for dialog visibility

  const {
    available_balance: raw_available_balance,
    in_escrow_balance: raw_in_escrow_balance,
    pending_balance: raw_pending_balance
  } = userBalances;

  // Ensure balances are numbers, default to 0 if not
  const available_balance = parseFloat(raw_available_balance) || 0;
  const in_escrow_balance = parseFloat(raw_in_escrow_balance) || 0;
  const pending_balance = parseFloat(raw_pending_balance) || 0;

  useEffect(() => {
    if (user?.user_id) {
      dispatch(getUserBalances());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (paymentSuccessMessage) {
      toast.success(paymentSuccessMessage);
      dispatch(clearPaymentSuccessMessage());
      setIsConfirmModalOpen(false); // Close modal on success
    }
    if (paymentError) {
      const errorMessageToDisplay = paymentError.detail || paymentError.message || 'An unknown error occurred.';
      toast.error(errorMessageToDisplay);
      dispatch(clearPaymentError());
      setIsConfirmModalOpen(false); // Close modal on error
    }
  }, [paymentSuccessMessage, paymentError, dispatch]);

  const handleInitiateTransfer = () => {
    if (pending_balance <= 0) {
      toast.error('لا يوجد رصيد معلق لتحويله.');
      return;
    }
    setIsConfirmModalOpen(true); // Open the custom confirmation dialog
  };

  const handleConfirmTransfer = async () => {
    try {
      await dispatch(transferPendingToAvailable()).unwrap();
      // Balances will be refreshed by getUserBalances dispatch within the thunk
      // Modal will be closed by useEffect on success/error
    } catch (err) {
      console.error('Failed to transfer pending balance:', err);
      // Error toast and modal closing handled by useEffect
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>إدارة الرصيد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الرصيد المتاح:</span>
          <span className="font-bold text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-green-600" />
            {available_balance.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الرصيد تحت الضمان:</span>
          <span className="font-bold text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-yellow-600" />
            {in_escrow_balance.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">الرصيد المعلق:</span>
          <span className="font-bold text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-orange-600" />
            {pending_balance.toFixed(2)}
          </span>
        </div>

        {pending_balance > 0 && (
          <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleInitiateTransfer}
                className="w-full mt-4"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>جاري التحويل...</span>
                  </>
                ) : (
                  'تحويل المال المعلق'
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تأكيد التحويل</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد أنك تريد تحويل <span className="font-bold">{pending_balance.toFixed(2)}</span> إلى رصيدك المتاح؟
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} disabled={paymentLoading}>
                  إلغاء
                </Button>
                <Button onClick={handleConfirmTransfer} disabled={paymentLoading}>
                  {paymentLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'تأكيد'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceDisplayAndTransfer;
