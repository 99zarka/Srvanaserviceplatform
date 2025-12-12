import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ServiceCategoriesCRUD } from "./ServiceCategoriesCRUD";
import { ServicesCRUD } from "./ServicesCRUD";
import { Briefcase } from "lucide-react";

export function AdminServices() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center space-x-2">
            <Briefcase className="h-7 w-7" />
            <span>إدارة الخدمات</span>
          </h1>
          <p className="text-muted-foreground">إدارة فئات الخدمات والخدمات</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="services">الخدمات</TabsTrigger>
              <TabsTrigger value="categories">فئات الخدمات</TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="mt-0">
              <ServicesCRUD />
            </TabsContent>
            <TabsContent value="categories" className="mt-0">
              <ServiceCategoriesCRUD />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
