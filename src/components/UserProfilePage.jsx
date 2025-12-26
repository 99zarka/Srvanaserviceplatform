import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile, fetchPublicUserProfile, fetchUserById, clearError } from "../redux/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import {
  CircleUser,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Info,
  User,
  Star,
  CheckCircle,
  Wrench,
  Clock,
  Award,
  Shield,
  Loader2,
  Plus,
  X as XIcon
} from "lucide-react";

import GovernorateSelect from './common/GovernorateSelect';
import { useGetServicesQuery } from "../services/api";
import { Skeleton } from "./ui/skeleton";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import "../styles/animations.css";

export function UserProfilePage() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [publicUserData, setPublicUserData] = useState(null);
  const isCurrentUser = user?.user_id === parseInt(userId) || userId === 'me';
  const isAdmin = user?.user_type === 'admin' || (user?.user_type?.user_type_id === 1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const specializationRef = useRef(null);

  useOnClickOutside(specializationRef, () => setShowServiceDropdown(false));

  const { data: servicesData, isLoading: loadingServices } = useGetServicesQuery({ page_size: 100 });

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
      specialization: "",
      skills_text: "",
      hourly_rate: "",
      experience_years: "",
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
        if (isAdmin) {
          dispatch(fetchUserById(userId)).then((action) => {
            if (fetchUserById.fulfilled.match(action)) {
              setPublicUserData(action.payload);
            }
          });
        } else {
          dispatch(fetchPublicUserProfile(userId)).then((action) => {
            if (fetchPublicUserProfile.fulfilled.match(action)) {
              setPublicUserData(action.payload);
            }
          });
        }
      }
    }
  }, [dispatch, isAuthenticated, token, userId, isCurrentUser, isAdmin]);

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
      setValue("specialization", dataToSet.specialization || "");
      setValue("skills_text", dataToSet.skills_text || "");
      setValue("hourly_rate", dataToSet.hourly_rate || "");
      setValue("experience_years", dataToSet.experience_years || "");
      setPreviewUrl(dataToSet.profile_photo || null);

      // Initialize selected specializations from existing data
      if (dataToSet.specialization && getUserTypeDisplay(dataToSet.user_type) === 'technician') {
        const specs = dataToSet.specialization.split(',').map(s => s.trim()).filter(s => s);
        // Note: We can't map back to service IDs without the full service data
        // For now, we'll just store the names and handle this in the UI
        setSelectedSpecializations(specs.map(name => ({ id: name, name })));
      }

      setIsEditing(false);
    } else {
      setValue("first_name", "");
      setValue("last_name", "");
      setValue("email", "");
      setValue("phone_number", "");
      setValue("governorate", "");
      setValue("detailed_address", "");
      setValue("bio", "");
      setValue("specialization", "");
      setValue("skills_text", "");
      setValue("hourly_rate", "");
      setValue("experience_years", "");
      setPreviewUrl(null);
      setSelectedSpecializations([]);
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
    if (!(isCurrentUser || isAdmin) || !isEditing) return;

    const address = `${data.governorate}, ${data.detailed_address}`;
    const submitData = { ...data, address };

    // Set specializations from selectedSpecializations
    if (currentUserData?.user_type && getUserTypeDisplay(currentUserData.user_type) === 'technician' && selectedSpecializations.length > 0) {
      submitData.specialization = selectedSpecializations.map(spec => spec.name).join(', ');
    }

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

    const resultAction = await dispatch(updateUserProfile({ userData: submitData, userId: isCurrentUser ? undefined : userId }));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success("تم تحديث الملف الشخصي بنجاح!");
      setIsEditing(false);
    } else {
      toast.error("فشل تحديث الملف الشخصي.");
    }
  };

  const handleServiceSelect = (service) => {
    const arabicName = service.arabic_name || service.service_name;
    if (!selectedSpecializations.some((spec) => spec.id === service.service_id)) {
      setSelectedSpecializations((prev) => [...prev, { id: service.service_id, name: arabicName }]);
    } else {
      removeSpecialization(service.service_id);
    }
  };

  const removeSpecialization = (id) => {
    setSelectedSpecializations((prev) => prev.filter((spec) => spec.id !== id));
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

  // Loading state
  if (!currentUserData && (isLoading || !isAuthenticated)) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl" dir="rtl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              {isCurrentUser ? "ملفي الشخصي" : "ملف المستخدم"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              جاري تحميل البيانات...
            </p>
          </div>
        </div>

        <Card className="shadow-lg rounded-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400">جاري تحميل بيانات الملف الشخصي...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            {isCurrentUser ? "ملفي الشخصي" : "ملف المستخدم"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isCurrentUser ? "عرض أو تحديث معلوماتك الشخصية" : "عرض معلومات المستخدم"}
          </p>
        </div>
        {(isCurrentUser || isAdmin) && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto px-6 py-3 text-lg flex items-center space-x-2 hover-lift"
          >
            <Edit className="h-5 w-5" />
            <span>تعديل الملف الشخصي</span>
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <Card className="shadow-xl rounded-2xl mb-8 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary shadow-2xl flex items-center justify-center bg-white dark:bg-gray-800">
                {currentUserData?.profile_photo ? (
                  <img
                    src={currentUserData.profile_photo}
                    alt="صورة الملف الشخصي"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <CircleUser className="w-full h-full text-gray-400 p-4" />
                )}
              </div>
              {/* Verification Badge */}
              {currentUserData?.verification_status === 'Verified' && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-right">
              <div className="fade-in-up">
                {currentUserData?.first_name && currentUserData?.last_name && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {currentUserData.first_name} {currentUserData.last_name}
                  </h2>
                )}

                <div className="flex items-center justify-center md:justify-end gap-2 mb-4">
                  <p className="text-xl text-primary dark:text-primary-400 font-semibold">
                    {currentUserData?.user_type ? (
                      getUserTypeDisplay(currentUserData.user_type) === 'client' ? 'عميل' :
                      getUserTypeDisplay(currentUserData.user_type) === 'technician' ? 'فني' :
                      getUserTypeDisplay(currentUserData.user_type) === 'admin' ? 'مشرف' :
                      getUserTypeDisplay(currentUserData.user_type)
                    ) : 'مستخدم'}
                  </p>
                  {currentUserData?.verification_status === 'Verified' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      موثق
                    </span>
                  )}
                </div>

                {/* Technician Stats */}
                {currentUserData?.user_type && getUserTypeDisplay(currentUserData.user_type) === 'technician' && (
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {currentUserData.overall_rating || '0.0'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">التقييم</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {currentUserData.num_jobs_completed || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">أعمال مكتملة</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {currentUserData.experience_years || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">سنوات الخبرة</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {(isCurrentUser || isAdmin) && isEditing ? (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">تعديل الملف الشخصي</CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center space-y-5 mb-6">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {previewUrl || currentUserData?.profile_photo ? (
                    <img
                      src={previewUrl || currentUserData?.profile_photo}
                      alt="صورة الملف الشخصي"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CircleUser className="w-full h-full text-gray-400 p-2" />
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
                  <Label htmlFor="first_name" className="text-base font-medium">الاسم الأول</Label>
                  <Input
                    id="first_name"
                    {...register("first_name", { required: "الاسم الأول مطلوب" })}
                    className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-base font-medium">الاسم الأخير</Label>
                  <Input
                    id="last_name"
                    {...register("last_name", { required: "الاسم الأخير مطلوب" })}
                    className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-medium">البريد الإلكتروني</Label>
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
                  className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number" className="text-base font-medium">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  {...register("phone_number", {
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
                    },
                  })}
                  className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="governorate" className="text-base font-medium">المحافظة</Label>
                  <Controller
                    name="governorate"
                    control={control}
                    render={({ field }) => (
                      <GovernorateSelect
                        id="governorate"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="detailed_address" className="text-base font-medium">العنوان التفصيلي</Label>
                  <Input
                    id="detailed_address"
                    {...register("detailed_address")}
                    className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-base font-medium">نبذة عني</Label>
                <Input
                  id="bio"
                  {...register("bio")}
                  className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Technician-specific fields */}
              {currentUserData?.user_type && getUserTypeDisplay(currentUserData.user_type) === 'technician' && (
                <>
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">المعلومات المهنية</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div ref={specializationRef}>
                        <Label htmlFor="specialization">التخصص *</Label>
                        <div className="relative">
                          <div className="min-h-10 p-2 border rounded-md bg-background mb-2 flex flex-wrap gap-2">
                            {selectedSpecializations.length === 0 ? (
                              <span className="text-muted-foreground text-sm">اختر تخصصًا أو أكثر</span>
                            ) : (
                              selectedSpecializations.map((spec) => (
                                <div key={spec.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                                  <span>{spec.name}</span>
                                  <button type="button" onClick={() => removeSpecialization(spec.id)} className="hover:bg-muted rounded-full p-0.5">
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                          <Button type="button" onClick={() => setShowServiceDropdown(!showServiceDropdown)} className="w-full justify-between" variant="outline">
                            <span>{showServiceDropdown ? "إغلاق" : "عرض التخصصات"}</span>
                            <Plus className={`w-4 h-4 transition-transform ${showServiceDropdown ? 'rotate-45' : ''}`} />
                          </Button>
                          {showServiceDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {loadingServices ? (
                                <div className="p-4 space-y-2">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                                  <Skeleton className="h-4 w-2/3" />
                                </div>
                              ) : (
                                (servicesData?.results || []).map((service) => (
                                  <label key={service.service_id} className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent">
                                    <input
                                      type="checkbox"
                                      checked={selectedSpecializations.some(spec => spec.id === service.service_id)}
                                      onChange={() => handleServiceSelect(service)}
                                      className="w-4 h-4"
                                    />
                                    <span>{service.arabic_name || service.service_name}</span>
                                  </label>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="hourly_rate" className="text-base font-medium">السعر بالساعة (جنيه)</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          {...register("hourly_rate", {
                            min: {
                              value: 0,
                              message: "السعر يجب أن يكون رقماً موجباً",
                            },
                          })}
                          placeholder="مثال: 50"
                          className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        {errors.hourly_rate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.hourly_rate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <Label htmlFor="experience_years" className="text-base font-medium">سنوات الخبرة</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          {...register("experience_years", {
                            min: {
                              value: 0,
                              message: "سنوات الخبرة يجب أن تكون رقماً موجباً",
                            },
                          })}
                          placeholder="مثال: 3"
                          className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        {errors.experience_years && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.experience_years.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="skills_text" className="text-base font-medium">المهارات</Label>
                      <Input
                        id="skills_text"
                        {...register("skills_text")}
                        placeholder="مثال: إصلاح الأجهزة الإلكترونية، الصيانة المنزلية، التركيب الكهربائي"
                        className="mt-1 p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 text-lg flex items-center space-x-2 hover-lift"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
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
                  className="w-full sm:w-auto px-8 py-3 text-lg flex items-center space-x-2 hover-lift"
                >
                  <X className="h-5 w-5" />
                  <span>إلغاء</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <div className="space-y-6">
          {/* Stats Cards for Technicians */}
          {currentUserData?.user_type && getUserTypeDisplay(currentUserData.user_type) === 'technician' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-lg hover-lift card-enter delay-100">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {currentUserData.overall_rating || '0.0'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">متوسط التقييم</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover-lift card-enter delay-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {currentUserData.num_jobs_completed || 0}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">أعمال مكتملة</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover-lift card-enter delay-300">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Award className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {currentUserData.experience_years || 0}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">سنوات الخبرة</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="shadow-lg hover-lift card-enter delay-400">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="h-5 w-5 mr-2" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(isCurrentUser || isAdmin) && currentUserData?.email && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                      <p className="font-medium">{currentUserData.email}</p>
                    </div>
                  </div>
                )}

                {(isCurrentUser || isAdmin) && currentUserData?.phone_number && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="font-medium">{currentUserData.phone_number}</p>
                    </div>
                  </div>
                )}

                {currentUserData?.address && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">العنوان</p>
                      <p className="font-medium">{currentUserData.address}</p>
                    </div>
                  </div>
                )}

                {currentUserData?.bio && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Info className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">نبذة عني</p>
                      <p className="font-medium">{currentUserData.bio}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            {currentUserData?.user_type && getUserTypeDisplay(currentUserData.user_type) === 'technician' && (
              <Card className="shadow-lg hover-lift card-enter delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Wrench className="h-5 w-5 mr-2" />
                    المعلومات المهنية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentUserData?.specialization && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Wrench className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">التخصص</p>
                        <p className="font-medium">{currentUserData.specialization}</p>
                      </div>
                    </div>
                  )}

                  {currentUserData?.skills_text && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Award className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">المهارات</p>
                        <p className="font-medium">{currentUserData.skills_text}</p>
                      </div>
                    </div>
                  )}

                  {currentUserData?.hourly_rate && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">السعر بالساعة</p>
                        <p className="font-medium">{currentUserData.hourly_rate} جنيه</p>
                      </div>
                    </div>
                  )}

                  {currentUserData?.verification_status === 'Verified' && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">حالة التوثيق</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          موثق
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {user && !isCurrentUser && (
              <Link to={`/dashboard/messages/${userId}`} className="flex-1">
                <Button className="w-full px-6 py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white hover-lift">
                  إرسال رسالة
                </Button>
              </Link>
            )}

            {user && currentUserData?.user_type === 'technician' && !isCurrentUser && (
              <Link to={`/offer/${userId}`} className="flex-1">
                <Button className="w-full px-6 py-3 text-lg hover-lift">
                  تقديم عرض مباشر
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
