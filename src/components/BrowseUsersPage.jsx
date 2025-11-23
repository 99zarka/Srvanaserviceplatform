import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, clearError } from "../redux/authSlice";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { toast } from "react-hot-toast";

export function BrowseUsersPage() {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

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
                <img
                  src={user.profile_photo || "https://res.cloudinary.com/dtg0z654d/image/upload/v1700777777/default_profile_pic.png"}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-300"
                />
                <h2 className="text-xl font-semibold mb-1">{user.first_name} {user.last_name}</h2>
                <p className="text-muted-foreground">{user.username}</p>
                {user.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
