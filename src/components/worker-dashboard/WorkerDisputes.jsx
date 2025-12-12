import React from "react";
import { DisputesList } from "../disputes/DisputesList";

export function WorkerDisputes() {
  return (
    <DisputesList
      userType="technician"
      title="نزاعاتي"
      subtitle="إدارة النزاعات المتعلقة بمهامك"
      orderLinkPrefix="/dashboard/tasks"
      orderLinkParam="taskId"
    />
  );
}
