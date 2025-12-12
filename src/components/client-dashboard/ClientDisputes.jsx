import React from "react";
import { DisputesList } from "../disputes/DisputesList";

export function ClientDisputes() {
  return (
    <DisputesList
      userType="client"
      title="نزاعاتي"
      subtitle="إدارة النزاعات المتعلقة بطلباتك"
      orderLinkPrefix="/orders/dashboard"
      orderLinkParam="orderId"
    />
  );
}
