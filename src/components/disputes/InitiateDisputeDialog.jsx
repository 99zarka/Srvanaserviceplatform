import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { initiateDispute } from "../../redux/orderSlice";
import { toast } from "sonner";

export function InitiateDisputeDialog({ isOpen, onOpenChange, orderId, onDisputeSuccess }) {
  const dispatch = useDispatch();
  const [disputeDescription, setDisputeDescription] = useState("");

  const handleConfirmDispute = async () => {
    if (orderId && disputeDescription.trim()) {
      try {
        await dispatch(initiateDispute({
          orderId: orderId,
          argument: disputeDescription,
        })).unwrap();
        toast.success("تم فتح نزاع بنجاح.");
        onDisputeSuccess(); // Callback to refresh data in parent
        onOpenChange(false); // Close dialog
      } catch (err) {
        toast.error(err.message || "فشل في فتح النزاع.");
      } finally {
        setDisputeDescription(""); // Clear description
      }
    } else {
      toast.error("الرجاء تقديم وصف تفصيلي للنزاع.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>فتح نزاع على المهمة</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="disputeDescription">وصف تفصيلي</Label>
            <Textarea
              id="disputeDescription"
              placeholder="قدم وصفًا تفصيليًا للمشكلة والنزاع."
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="default" className="bg-orange-500 hover:bg-orange-600" onClick={handleConfirmDispute}>
            تأكيد فتح النزاع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
