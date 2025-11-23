import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicUsersPaginated, clearError } from "../redux/authSlice";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button"; // Assuming a Button component exists for pagination
import { toast } from "react-hot-toast";
import { CircleUser, ArrowLeft, ArrowRight } from "lucide-react";

export function BrowseUsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading, error, currentPage, totalPages } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPublicUsersPaginated({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      dispatch(fetchPublicUsersPaginated({ page: currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(fetchPublicUsersPaginated({ page: currentPage + 1 }));
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (isLoading) {
    return <div className="text-center p-8">جاري تحميل المستخدمين...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center p-8">لا يوجد مستخدمين لعرضهم.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">تصفح المستخدمين</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <Card key={user.user_id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Link to={`/profile/${user.user_id}`} className="block">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-300"
                  />
                ) : (
                  <CircleUser className="w-24 h-24 text-gray-400 mb-4 border-2 border-gray-300 rounded-full p-2" />
                )}
                <h2 className="text-xl font-semibold mb-1">{user.first_name} {user.last_name}</h2>
                <p className="text-muted-foreground">{user.username}</p>
                {user.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center items-center space-x-4 mt-8">
        <Button onClick={handlePreviousPage} disabled={currentPage === 1} className="flex items-center space-x-2">
          <ArrowRight className="h-4 w-4" />
          <span>السابق</span>
        </Button>
        <span>
          صفحة {currentPage} من {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center space-x-2">
          <span>التالي</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
