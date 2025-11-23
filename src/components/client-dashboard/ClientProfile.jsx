import React, { useEffect, useState } from "react"; // Import useState
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, clearError, login, register } from "../../redux/authSlice"; // Added login and register for dispatching after initial load if needed
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "react-hot-toast";

export function ClientProfile() {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    watch, // Import watch to observe input values
    formState: { errors },
  } = useForm();

  const [previewUrl, setPreviewUrl] = useState(null); // State for image preview URL
  const profilePhotoFile = watch("profile_photo"); // Watch the file input

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, token]);

  useEffect(() => {
    if (user) {
      setValue("first_name", user.first_name || "");
      setValue("last_name", user.last_name || "");
      setValue("email", user.email || "");
      setValue("phone_number", user.phone_number || "");
      setValue("address", user.address || "");
      setValue("bio", user.bio || "");
      // Set initial preview URL if user already has a profile photo
      setPreviewUrl(user.profile_photo || null);
    }
  }, [user, setValue]);

  useEffect(() => {
    // Create preview URL when a file is selected
    if (profilePhotoFile && profilePhotoFile.length > 0 && profilePhotoFile[0] instanceof File) {
      const file = profilePhotoFile[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Clean up object URL on unmount or when a new file is selected
      return () => URL.revokeObjectURL(url);
    } else if (!user?.profile_photo) {
      // If no file is selected and no existing profile photo, clear preview
      setPreviewUrl(null);
    }
  }, [profilePhotoFile, user?.profile_photo]); // Dependency on profilePhotoFile and user.profile_photo

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const submitData = { ...data };

    // Handle profile_photo separately if a new file is selected
    if (submitData.profile_photo && submitData.profile_photo.length > 0) {
      submitData.profile_photo = submitData.profile_photo[0]; // Get the File object
    } else {
      // If no new file is selected, remove profile_photo from payload to avoid sending empty/null string
      // The backend will retain the existing photo if not explicitly updated
      delete submitData.profile_photo;
    }

    // Remove user_id from the payload as it's not needed for the /users/me/ endpoint
    // The thunk already handles it without userId in the parameters
    delete submitData.user_id;

    // Remove empty strings for optional fields to avoid issues with backend validation or unexpected updates
    for (const key in submitData) {
      if (typeof submitData[key] === 'string' && submitData[key].trim() === '') {
        submitData[key] = null;
      }
    }

    // The backend `updateUserProfile` thunk already uses `/users/me/` and infers the user
    const resultAction = await dispatch(updateUserProfile({ userData: submitData }));
    
    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("تم تحديث الملف الشخصي بنجاح!");
    } else {
      toast.error("فشل تحديث الملف الشخصي.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">إعدادات الملف الشخصي</h1>
        <p className="text-muted-foreground">تحديث معلوماتك الشخصية</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                <img
                  src={previewUrl || user?.profile_photo || "https://res.cloudinary.com/dtg0z654d/image/upload/v1700777777/default_profile_pic.png"} // Use previewUrl if available, else user's photo, else default
                  alt="صورة الملف الشخصي"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Label htmlFor="profile_photo_upload">تغيير صورة الملف الشخصي</Label>
                <Input
                  id="profile_photo_upload"
                  type="file"
                  accept="image/*"
                  {...register("profile_photo")}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {errors.profile_photo && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.profile_photo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">الاسم الأول</Label>
                <Input
                  id="first_name"
                  {...register("first_name", {
                    required: "الاسم الأول مطلوب",
                  })}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">الاسم الأخير</Label>
                <Input
                  id="last_name"
                  {...register("last_name", {
                    required: "الاسم الأخير مطلوب",
                  })}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
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
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">رقم الهاتف</Label>
              <Input
                id="phone_number"
                {...register("phone_number", {
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
                  },
                })}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" {...register("address")} />
            </div>

            <div>
              <Label htmlFor="bio">نبذة عني</Label>
              <Input id="bio" {...register("bio")} />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
