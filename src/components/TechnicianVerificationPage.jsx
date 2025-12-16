import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getVerificationStatus, uploadVerificationDocuments } from "../redux/verificationSlice";
import { useGetServicesQuery } from "../services/api";

export function TechnicianVerificationPage({ isDialog = false, onSuccess }) {
  const [documents, setDocuments] = useState({
    id_document: null,
    certificate_document: null,
    portfolio_document: null
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Fetch services using Redux/RTK Query
  const { data: servicesData, isLoading: loadingServices, isError } = useGetServicesQuery({ page_size: 100 });
  
  // Get Redux state for verification
  const verification = useSelector((state) => state.verification);
  const { 
    verificationStatus, 
    isUploading, 
    uploadProgress, 
    error: submitError 
  } = verification;
  
  // Get auth state - Simplified authentication check
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      skills: "",
      experience_years: "",
      hourly_rate: "",
      description: "",
      address: "",
      specialization: ""
    }
  });

  useEffect(() => {
    // Fetch verification status when user data becomes available
    if (user && user.id) {
      dispatch(getVerificationStatus(user.id));
    } else if (token && !user) {
      // If we have a token but no user data yet, try to fetch user profile
      // This will be handled by the authSlice automatically
    }
  }, [dispatch, user, token]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setDocuments(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  // Form validation schema
  const validationRules = {
    experience_years: {
      required: "سنوات الخبرة مطلوبة",
      min: {
        value: 0,
        message: "سنوات الخبرة يجب أن تكون صفر أو أكثر"
      },
      max: {
        value: 50,
        message: "سنوات الخبرة يجب أن تكون 50 أو أقل"
      }
    },
    hourly_rate: {
      required: "السعر لكل ساعة مطلوب",
      min: {
        value: 1,
        message: "السعر يجب أن يكون ريال واحد على الأقل"
      }
    },
    address: {
      required: "العنوان مطلوب",
      minLength: {
        value: 5,
        message: "العنوان يجب أن يكون 5 أحرف على الأقل"
      }
    },
    description: {
      required: "وصف الخدمات مطلوب",
      minLength: {
        value: 10,
        message: "الوصف يجب أن يكون 10 أحرف على الأقل"
      }
    },
    skills: {
      required: "المهارات مطلوبة",
      minLength: {
        value: 3,
        message: "المهارات يجب أن تكون 3 أحرف على الأقل"
      }
    }
  };

  // Function to handle service selection
  const handleServiceSelect = (service) => {
    const arabicName = service.arabic_name || service.service_name;
    if (!selectedSpecializations.some(spec => spec.id === service.service_id)) {
      setSelectedSpecializations(prev => [...prev, { id: service.service_id, name: arabicName }]);
    }
  };

  // Function to remove a selected specialization
  const removeSpecialization = (id) => {
    setSelectedSpecializations(prev => prev.filter(spec => spec.id !== id));
  };

  const onSubmit = async (formData) => {
    // Simplified authentication check - just check token
    if (!token) {
      console.log('No token found, cannot submit verification');
      return;
    }

    // Validate that at least one specialization is selected
    if (selectedSpecializations.length === 0) {
      alert('يرجى اختيار تخصص واحد على الأقل');
      return;
    }

    // If we don't have user data but have token, we can still submit
    // The backend will handle user identification via the token
    const userId = user?.id;

    // Validate ID document is uploaded
    if (!documents.id_document) {
      console.log('ID document is required');
      return;
    }

    // Create FormData for file uploads
    const verificationData = new FormData();
    
    // Add form fields - update specialization to be comma-separated Arabic names
    const updatedFormData = { ...formData };
    if (selectedSpecializations.length > 0) {
      updatedFormData.specialization = selectedSpecializations.map(spec => spec.name).join(',');
    } else {
      updatedFormData.specialization = formData.specialization; // fallback to original if no selections
    }

    // Add form fields
    Object.keys(updatedFormData).forEach(key => {
      verificationData.append(key, updatedFormData[key]);
    });
    
    // Add files
    Object.keys(documents).forEach(key => {
      if (documents[key]) {
        verificationData.append(key, documents[key]);
      }
    });

    console.log('Submitting verification with token:', token ? 'present' : 'missing');
    console.log('Specialization being sent:', updatedFormData.specialization);

    // Dispatch the Redux action
    const resultAction = await dispatch(uploadVerificationDocuments(verificationData));

    if (uploadVerificationDocuments.fulfilled.match(resultAction)) {
      // Success - verification status will be updated automatically by Redux
      console.log('Verification submitted successfully');
      
      // Show success message
      alert('تم تقديم طلب التحقق بنجاح! سيقوم المسؤول بمراجعة طلبك قريباً.');
      
      // If we have user data, fetch updated verification status
      if (userId) {
        dispatch(getVerificationStatus(userId));
      }
      
      // If this is a dialog and onSuccess callback provided, call it
      if (isDialog && onSuccess) {
        onSuccess();
      }
    } else {
      console.log('Verification submission failed:', resultAction.error);
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // If user is already verified, redirect to worker dashboard (only if not in dialog mode)
  useEffect(() => {
    if (!isDialog && user && user.verification_status === 'approved') {
      navigate('/dashboard');
    }
  }, [user, navigate, isDialog]);

  // Simplified authentication check - just check for token
  const isUserAuthenticated = isAuthenticated && token;
  const effectiveUser = user;

  // Users can apply for technician upgrade if they have a token (authenticated)
  const canApplyForTechnician = isUserAuthenticated && token;

  // Show login requirement only if not authenticated at all (skip in dialog mode)
  if (!isDialog && !token) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">يتطلب تسجيل الدخول</h2>
              <p className="text-muted-foreground mb-4">
                يجب تسجيل الدخول أولاً للوصول إلى صفحة التحقق من الهوية
              </p>
              <Button onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is already a technician, show message and button to go home (skip in dialog mode)
  if (!isDialog && effectiveUser && effectiveUser.user_type === 'technician') {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">أنت بالفعل فني</h2>
              <p className="text-muted-foreground mb-4">
                حسابك مصنف كفني بالفعل. يمكنك الوصول إلى لوحة المعلومات الخاصة بك وتقديم الخدمات.
              </p>
              <Button onClick={() => navigate('/')}>
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main content component
  const formContent = (
    <div dir="rtl">
      {isError ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">خطأ في تحميل الخدمات</h2>
          <p className="text-muted-foreground mb-4">
            تعذر تحميل قائمة الخدمات. يرجى المحاولة مرة أخرى لاحقاً.
          </p>
          <Button onClick={() => window.location.reload()}>
            إعادة تحميل الصفحة
          </Button>
        </div>
      ) : (
        <>
          {!isDialog && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">طلب التحقق من الهوية</h1>
              <p className="text-muted-foreground">
                قدم المستندات المطلوبة لتحويل حسابك إلى فني وتقديم خدماتك
              </p>
            </div>
          )}

          {/* User Info Card */}
          {effectiveUser && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  مرحباً، {effectiveUser?.first_name || effectiveUser?.email || 'المستخدم'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">نوع الحساب الحالي:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                    {effectiveUser?.user_type === 'client' ? 'عميل' : 
                     effectiveUser?.user_type === 'worker' ? 'عامل' : 
                     effectiveUser?.user_type === 'technician' ? 'فني' : 
                     effectiveUser?.user_type === 'service_provider' ? 'مقدم خدمة' : effectiveUser?.user_type || 'غير محدد'}
                  </span>
                </div>
                {effectiveUser?.user_type === 'client' && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      يمكنك تحويل حسابك إلى فني من خلال هذه العملية
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Loading user data message */}
          {!effectiveUser && (
            <Card className="mb-6">
              <CardContent className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  جارٍ تحميل بيانات المستخدم...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Current Status Card */}
          {verificationStatus && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(verificationStatus.verification_status)}
                  حالة التحقق الحالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">الحالة:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationStatus.verification_status)}`}>
                    {getStatusText(verificationStatus.verification_status)}
                  </span>
                </div>
                {verificationStatus.rejection_reason && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-600">سبب الرفض:</p>
                    <p className="text-sm text-red-600">{verificationStatus.rejection_reason}</p>
                  </div>
                )}
                {verificationStatus.submitted_at && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">تاريخ التقديم:</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(verificationStatus.submitted_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* If verification is approved, show success message */}
          {effectiveUser?.verification_status === 'approved' && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                تم التحقق من هويتك بنجاح! يمكنك الآن الوصول إلى لوحة تحكم الفني.
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Form */}
          {(!verificationStatus || verificationStatus.verification_status === 'rejected') && (
            <Card>
              <CardHeader>
                <CardTitle>تقديم طلب التحقق</CardTitle>
                <CardDescription>
                  املأ النموذج التالي وارفع المستندات المطلوبة لتحويل حسابك إلى فني
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">المعلومات الشخصية والمهنية</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization">التخصص *</Label>
                      <div className="relative">
                        {/* Selected specializations display */}
                        <div className="min-h-10 p-2 border-input rounded-md bg-input-background mb-2 max-h-32 overflow-y-auto">
                          {selectedSpecializations.length === 0 ? (
                            <span className="text-muted-foreground text-sm">لم يتم اختيار تخصصات</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {selectedSpecializations.map((spec) => (
                                <div
                                  key={spec.id}
                                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
                                >
                                  <span>{spec.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeSpecialization(spec.id)}
                                    className="hover:bg-primary/80 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Button to show all services */}
                        <Button
                          type="button"
                          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                          className="w-full justify-between"
                          variant="outline"
                        >
                          <span>اختر التخصصات</span>
                          <svg className={`w-4 h-4 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Button>

                        {/* Services dropdown with checkboxes */}
                        {showServiceDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {loadingServices ? (
                              <div className="p-2 text-center text-sm">جاري التحميل...</div>
                            ) : (servicesData?.results || servicesData || []).length === 0 ? (
                              <div className="p-2 text-center text-sm">لا توجد خدمات متاحة</div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {(servicesData?.results || servicesData || []).map((service) => {
                                  const arabicName = service.arabic_name || service.service_name;
                                  const isSelected = selectedSpecializations.some(spec => spec.id === service.service_id);
                                  return (
                                    <label
                                      key={service.service_id}
                                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent text-sm ${
                                        isSelected ? 'bg-accent' : ''
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {
                                          if (isSelected) {
                                            removeSpecialization(service.service_id);
                                          } else {
                                            handleServiceSelect(service);
                                          }
                                        }}
                                        className="w-4 h-4 rounded border-input"
                                      />
                                      <span className="text-right flex-1">{arabicName}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.specialization && !selectedSpecializations.length && (
                        <p className="text-sm text-red-600 mt-1">{errors.specialization.message}</p>
                      )}
                    </div>
                      
                      <div>
                        <Label htmlFor="experience_years">سنوات الخبرة *</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          min="0"
                          max="50"
                          {...register('experience_years', validationRules.experience_years)}
                          placeholder="5"
                          className={errors.experience_years ? 'border-red-500' : ''}
                        />
                        {errors.experience_years && (
                          <p className="text-sm text-red-600 mt-1">{errors.experience_years.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hourly_rate">السعر لكل ساعة (ريال) *</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        min="1"
                        {...register('hourly_rate', validationRules.hourly_rate)}
                        placeholder="100"
                        className={errors.hourly_rate ? 'border-red-500' : ''}
                      />
                      {errors.hourly_rate && (
                        <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">العنوان *</Label>
                      <Input
                        id="address"
                        {...register('address', validationRules.address)}
                        placeholder="الرياض، حي النخيل"
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">وصف الخدمات *</Label>
                      <textarea
                        id="description"
                        {...register('description', validationRules.description)}
                        placeholder="اكتب وصفاً مفصلاً للخدمات التي تقدمها..."
                        className={`w-full min-h-[100px] p-3 border-input rounded-md resize-none ${errors.description ? 'border-red-500' : ''}`}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="skills">المهارات *</Label>
                      <Input
                        id="skills"
                        {...register('skills', validationRules.skills)}
                        placeholder="مثال: تركيب الإضاءة، إصلاح الأسلاك"
                        className={errors.skills ? 'border-red-500' : ''}
                      />
                      {errors.skills && (
                        <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">المستندات المطلوبة</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="id_document">صورة من الهوية الوطنية *</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            id="id_document"
                            name="id_document"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-70 hover:file:bg-blue-100"
                            required
                          />
                        </div>
                        {!documents.id_document && (
                          <p className="text-sm text-red-600 mt-1">صورة الهوية مطلوبة</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="certificate_document">الشهادات والمؤهلات (اختياري)</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            id="certificate_document"
                            name="certificate_document"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="portfolio_document">معرض الأعمال (اختياري)</Label>
                        <div className="mt-1">
                          <input
                            type="file"
                            id="portfolio_document"
                            name="portfolio_document"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>جارٍ الرفع...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {/* Error Alert */}
                  {submitError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {typeof submitError === 'string' ? submitError : 'حدث خطأ أثناء تقديم طلب التحقق. يرجى المحاولة مرة أخرى.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isUploading || isSubmitting || !canApplyForTechnician}
                  >
                    {(isUploading || isSubmitting) ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-pulse" />
                        جارٍ تقديم الطلب...
                      </>
                    ) : !canApplyForTechnician ? (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        يتطلب تسجيل الدخول
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        تقديم طلب التحقق لتصبح فنياً
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Pending Status Message */}
          {verificationStatus?.verification_status === 'pending' && (
            <Alert className="mt-6 border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                تم تقديم طلب التحقق الخاص بك وهو قيد المراجعة من قبل الإدارة. 
                ستتلقى إشعاراً عند اكتمال المراجعة.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );

  // If in dialog mode, return only the form content
  if (isDialog) {
    return formContent;
  }

  // Otherwise, wrap in full page layout
  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {formContent}
      </div>
    </div>
  );
}
