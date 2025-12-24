import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, fetchPublicUserProfile, clearError } from "../redux/authSlice";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { CircleUser, Edit, Save, X, Mail, Phone, MapPin, Info, User } from "lucide-react";


import GovernorateSelect from './common/GovernorateSelect';

export function UserProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [publicUserData, setPublicUserData] = useState(null);
  const isCurrentUser = user?.user_id === parseInt(userId) || userId === 'me';
  const [isEditing, setIsEditing] = useState(false);

  const currentUserData = isCurrentUser ? user : publicUserData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      governorate: "",
      detailed_address: "",
      bio: "",
      profile_photo: null
    }
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const profilePhotoFile = watch("profile_photo");

  useEffect(() => {
    if (userId) {
      if (isCurrentUser) {
        if (isAuthenticated && token) {
          dispatch(fetchUserProfile());
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
      const [governorate, detailed_address] = dataToSet.address ? dataToSet.address.split(',').map(s => s.trim()) : ["", ""];
      
      setValue("first_name", dataToSet.first_name || "");
      setValue("last_name", dataToSet.last_name || "");
      setValue("email", dataToSet.email || "");
      setValue("phone_number", dataToSet.phone_number || "");
      setValue("governorate", governorate || "");
      setValue("detailed_address", detailed_address || "");
      setValue("bio", dataToSet.bio || "");
      setPreviewUrl(dataToSet.profile_photo || null);
      setIsEditing(false);
    } else {
      setValue("first_name", "");
      setValue("last_name", "");
      setValue("email", "");
      setValue("phone_number", "");
      setValue("governorate", "");
      setValue("detailed_address", "");
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
      toast.error(`خطأ: ${error}`);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    if (!isCurrentUser || !isEditing) return;

    const address = `${data.governorate}, ${data.detailed_address}`;
    const submitData = { ...data, address };
    
    // remove governorate and detailed_address
    delete submitData.governorate;
    delete submitData.detailed_address;


    if (submitData.profile_photo && submitData.profile_photo.length > 0) {
      submitData.profile_photo = submitData.profile_photo[0];
    } else {
      if (!previewUrl) {
         submitData.profile_photo = null;
      } else {
        delete submitData.profile_photo;
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
      setIsEditing(false);
    } else {
      toast.error("فشل تحديث الملف الشخصي.");
    }
  };

  const getUserTypeDisplay = (userType) => {
    if (!userType) return '';
    if (typeof userType === 'string') return userType;
    if (typeof userType === 'object' && userType.user_type_name) return userType.user_type_name;
    if (typeof userType === 'object' && userType.user_type_id) {
      const typeMap = { 1: 'admin', 2: 'technician', 3: 'client' };
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="governorate" className="text-base">المحافظة</Label>
                  <Controller
                    name="governorate"
                    control={control}
                    render={({ field }) => (
                      <GovernorateSelect
                        id="governorate"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="detailed_address" className="text-base">العنوان التفصيلي</Label>
                  <Input
                    id="detailed_address"
                    {...register("detailed_address")}
                    className="mt-1 p-3 border rounded-md w-full focus:ring focus:ring-primary-200"
                  />
                </div>
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
                {currentUserData?.user_type && (
                  <p className="text-xl text-primary dark:text-primary-400 font-semibold">
                    {getUserTypeDisplay(currentUserData.user_type) === 'client' ? 'عميل' : getUserTypeDisplay(currentUserData.user_type) === 'technician' ? 'فني' : getUserTypeDisplay(currentUserData.user_type) === 'admin' ? 'مشرف' : getUserTypeDisplay(currentUserData.user_type)}
                  </p>
                )}
              </div>

              {isCurrentUser && currentUserData?.email && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>البريد الإلكتروني</span>
                  </p>
                  <p className="text-lg text-foreground font-medium">{currentUserData.email}</p>
                </div>
              )}

              {isCurrentUser && currentUserData?.phone_number && (
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

              {currentUserData?.user_type && (
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

              {user && !isCurrentUser && (
                <div className="mt-4">
                  <Link to={`/dashboard/messages/${userId}`}>
                    <Button className="w-full px-6 py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white">
                      إرسال رسالة
                    </Button>
                  </Link>
                </div>
              )}

              {user && currentUserData?.user_type === 'technician' && !isCurrentUser && (
                <div className="mt-4">
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
