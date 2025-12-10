import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, fetchPublicUserProfile, clearError } from "../redux/authSlice";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom"; // Import useParams and Link
import { CircleUser, Edit, Save, X, Mail, Phone, MapPin, Info, User } from "lucide-react";
// Removed Dialog and DirectOfferForm imports as direct offer will now be a separate route

export function UserProfilePage() {
  const { userId } = useParams(); // Get userId from URL params
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [publicUserData, setPublicUserData] = useState(null); // State for public user data
  const isCurrentUser = user?.user_id === parseInt(userId) || userId === 'me'; // Determine if viewing own profile
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  // Removed isOfferModalOpen state

  const currentUserData = isCurrentUser ? user : publicUserData; // Data source for form and display

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [previewUrl, setPreviewUrl] = useState(null);
  const profilePhotoFile = watch("profile_photo");

  useEffect(() => {
    if (userId) { // Fetch profile if userId is present in URL
      if (isCurrentUser) {
        if (isAuthenticated && token) {
          dispatch(fetchUserProfile()); // Fetches current user's profile
        }
      } else {
        dispatch(fetchPublicUserProfile(userId)).then((action) => {
          if (fetchPublicUserProfile.fulfilled.match(action)) {
            setPublicUserData(action.payload);
          }
        });
      }
    }
  }, [dispatch, isAuthenticated, token, userId, isCurrentUser]);

  useEffect(() => {
    const dataToSet = isCurrentUser ? user : publicUserData;

    if (dataToSet) {
      setValue("first_name", dataToSet.first_name || "");
      setValue("last_name", dataToSet.last_name || "");
      setValue("email", dataToSet.email || "");
      setValue("phone_number", dataToSet.phone_number || "");
      setValue("address", dataToSet.address || "");
      setValue("bio", dataToSet.bio || "");
      setPreviewUrl(dataToSet.profile_photo || null);
      // Reset isEditing when currentUserData changes, to ensure profile is viewed initially
      setIsEditing(false);
    } else {
      // Clear values if no user data is available (e.g., loading or not found)
      setValue("first_name", "");
      setValue("last_name", "");
      setValue("email", "");
      setValue("phone_number", "");
      setValue("address", "");
      setValue("bio", "");
      setPreviewUrl(null);
      setIsEditing(false);
    }
  }, [currentUserData, setValue, publicUserData, user, isCurrentUser]);


  useEffect(() => {
    if (profilePhotoFile && profilePhotoFile.length > 0 && profilePhotoFile[0] instanceof File) {
      const file = profilePhotoFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (currentUserData && !currentUserData.profile_photo) {
      setPreviewUrl(null);
    } else if (currentUserData && currentUserData.profile_photo) {
      setPreviewUrl(currentUserData.profile_photo);
    }
  }, [profilePhotoFile, currentUserData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    if (!isCurrentUser || !isEditing) return; // Prevent submission if not current user's profile or not in edit mode

    const submitData = { ...data };

    if (submitData.profile_photo && submitData.profile_photo.length > 0) {
      submitData.profile_photo = submitData.profile_photo[0];
    } else {
      // If no new photo is selected, and there was a previous one, keep it.
      // If explicitly cleared (e.g., new file input is empty array and old photo existed),
      // we need a mechanism to signal clearing the photo, currently not implemented.
      // For now, if no new file, don't send the photo key unless it was explicitly null.
      if (!previewUrl) { // If previewUrl is null, it means no photo or cleared.
         submitData.profile_photo = null;
      } else {
        delete submitData.profile_photo; // Don't send if no change
      }
    }

    delete submitData.user_id;

    for (const key in submitData) {
      if (typeof submitData[key] === 'string' && submitData[key].trim() === '') {
        submitData[key] = null;
      }
    }

    const resultAction = await dispatch(updateUserProfile({ userData: submitData }));
    
    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("تم تحديث الملف الشخصي بنجاح!");
      setIsEditing(false); // Exit edit mode on successful save
    } else {
      toast.error("فشل تحديث الملف الشخصي.");
    }
  };

  // Helper function to get user type display name
  const getUserTypeDisplay = (userType) => {
    if (!userType) return '';
    if (typeof userType === 'string') {
      return userType;
    }
    if (typeof userType === 'object' && userType.user_type_name) {
      return userType.user_type_name;
    }
    if (typeof userType === 'object' && userType.user_type_id) {
      // Map user_type_id to display name if needed
      const typeMap = {
        1: 'admin',
        2: 'technician', 
        3: 'client'
      };
      return typeMap[userType.user_type_id] || 'unknown';
    }
    return String(userType);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            {isCurrentUser ? "ملفي الشخصي" : "ملف المستخدم"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isCurrentUser ? "عرض أو تحديث معلوماتك الشخصية" : "عرض معلومات المستخدم"}
          </p>
        </div>
        {isCurrentUser && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto px-6 py-2 text-lg flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>تعديل الملف الشخصي</span>
          </Button>
        )}
      </div>

      <Card className="shadow-lg rounded-xl">
        <CardContent className="p-6 sm:p-8">
          {isCurrentUser && isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center space-y-5 mb-6">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary-500 shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {previewUrl || currentUserData?.profile_photo ? (
                    <img
                      src={previewUrl || currentUserData?.profile_photo}
                      alt="صورة الملف الشخصي"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUser className="w-full h-full text-gray-40 p-2" />
                  )}
                </div>
                <div className="text-center">
                  <Label htmlFor="profile_photo_upload" className="cursor-pointer text-primary hover:underline text-base font-medium">
                    تغيير صورة الملف الشخصي
                  </Label>
                  <Input
                    id="profile_photo_upload"
                    type="file"
                    accept="image/*"
                    {...register("profile_photo")}
                    className="hidden"
                  />
                  {errors.profile_photo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.profile_photo.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name" className="text-base">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    {...register("first_name", { required: "الاسم الأول مطلوب" })}
                    className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-base">الاسم الأخير</Label>
                  <Input
                    id="last_name"
                    {...register("last_name", { required: "الاسم الأخير مطلوب" })}
                    className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "صيغة البريد الإلكتروني غير صحيحة",
                    },
                  })}
                  className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number" className="text-base">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  {...register("phone_number", {
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
                    },
                  })}
                  className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-base">العنوان</Label>
                <Input id="address" {...register("address")} className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200" />
              </div>

              <div>
                <Label htmlFor="bio" className="text-base">نبذة عني</Label>
                <Input id="bio" {...register("bio")} className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-2 text-lg flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <Save className="h-5 w-5 animate-pulse" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-6 py-2 text-lg flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>إلغاء</span>
                </Button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-5 mb-8">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg flex items-center justify-center bg-gray-10 dark:bg-gray-800">
                  {currentUserData?.profile_photo ? (
                    <img
                      src={currentUserData?.profile_photo}
                      alt="صورة الملف الشخصي"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUser className="w-full h-full text-gray-400 p-2" />
                  )}
                </div>
                {currentUserData?.first_name && currentUserData?.last_name && (
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-4">
                    {currentUserData.first_name} {currentUserData.last_name}
                  </h2>
                )}
                {currentUserData?.user_type && ( // Display user type prominently
                  <p className="text-xl text-primary dark:text-primary-400 font-semibold">
                    {getUserTypeDisplay(currentUserData.user_type) === 'client' ? 'عميل' : getUserTypeDisplay(currentUserData.user_type) === 'technician' ? 'فني' : getUserTypeDisplay(currentUserData.user_type) === 'admin' ? 'مشرف' : getUserTypeDisplay(currentUserData.user_type)}
                  </p>
                )}
              </div>

              {isCurrentUser && currentUserData?.email && ( // Display email only for current user
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>البريد الإلكتروني</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">{currentUserData.email}</p>
                </div>
              )}

              {isCurrentUser && currentUserData?.phone_number && ( // Display phone number only for current user
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>رقم الهاتف</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">{currentUserData.phone_number}</p>
                </div>
              )}

              {currentUserData?.address && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>العنوان</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">{currentUserData.address}</p>
                </div>
              )}

              {currentUserData?.bio && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <Info className="h-4 w-4" />
                    <span>نبذة عني</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">{currentUserData.bio}</p>
                </div>
              )}

              {currentUserData?.user_type && ( // Display user type
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>نوع المستخدم</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">
                    {getUserTypeDisplay(currentUserData.user_type) === 'client' ? 'عميل' : getUserTypeDisplay(currentUserData.user_type) === 'technician' ? 'فني' : getUserTypeDisplay(currentUserData.user_type) === 'admin' ? 'مشرف' : getUserTypeDisplay(currentUserData.user_type)}
                  </p>
                </div>
              )}

              {/* Make Direct Offer Button and Modal */}
              {user && currentUserData?.user_type === 'technician' && !isCurrentUser && (
                <div className="mt-8">
                  <Link to={`/offer/${userId}`}>
                    <Button className="w-full px-6 py-3 text-lg">
                      تقديم عرض مباشر
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
