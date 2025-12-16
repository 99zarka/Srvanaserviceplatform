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
import { FileUpload } from "./FileUpload";
import { Skeleton } from "./ui/skeleton";

export function TechnicianVerificationPage({ isDialog = false, onSuccess }) {
  const [documents, setDocuments] = useState({
    id_document: null,
    certificate_document: null,
    portfolio_document: null,
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  const { data: servicesData, isLoading: loadingServices, isError } = useGetServicesQuery({ page_size: 100 });
  const verification = useSelector((state) => state.verification);
  const { verificationStatus, isUploading, uploadProgress, error: submitError } = verification;
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      skills: "",
      experience_years: "",
      hourly_rate: "",
      description: "",
      address: "",
    },
  });

  useEffect(() => {
    if (user && user.id) {
      dispatch(getVerificationStatus(user.id));
    }
  }, [dispatch, user]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setDocuments((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleFileRemove = (name) => {
    setDocuments((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const validationRules = {
    experience_years: {
      required: "سنوات الخبرة مطلوبة",
      min: { value: 0, message: "سنوات الخبرة يجب أن تكون صفر أو أكثر" },
      max: { value: 50, message: "سنوات الخبرة يجب أن تكون 50 أو أقل" },
    },
    hourly_rate: {
      required: "السعر لكل ساعة مطلوب",
      min: { value: 1, message: "السعر يجب أن يكون جنيه مصري واحد على الأقل" },
    },
    address: {
      required: "العنوان مطلوب",
      minLength: { value: 5, message: "العنوان يجب أن يكون 5 أحرف على الأقل" },
    },
    description: {
      required: "وصف الخدمات مطلوب",
      minLength: { value: 10, message: "الوصف يجب أن يكون 10 أحرف على الأقل" },
    },
    skills: {
      required: "المهارات مطلوبة",
      minLength: { value: 3, message: "المهارات يجب أن تكون 3 أحرف على الأقل" },
    },
  };

  const handleServiceSelect = (service) => {
    const arabicName = service.arabic_name || service.service_name;
    if (!selectedSpecializations.some((spec) => spec.id === service.service_id)) {
      setSelectedSpecializations((prev) => [...prev, { id: service.service_id, name: arabicName }]);
    }
  };

  const removeSpecialization = (id) => {
    setSelectedSpecializations((prev) => prev.filter((spec) => spec.id !== id));
  };

  const onSubmit = async (formData) => {
    if (!token) return;

    if (selectedSpecializations.length === 0) {
      alert('يرجى اختيار تخصص واحد على الأقل');
      return;
    }

    if (!documents.id_document) {
      alert('صورة الهوية مطلوبة');
      return;
    }

    const verificationData = new FormData();
    const updatedFormData = { ...formData };
    if (selectedSpecializations.length > 0) {
      updatedFormData.specialization = selectedSpecializations.map((spec) => spec.name).join(',');
    }

    Object.keys(updatedFormData).forEach((key) => {
      verificationData.append(key, updatedFormData[key]);
    });

    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        verificationData.append(key, documents[key]);
      }
    });

    const resultAction = await dispatch(uploadVerificationDocuments(verificationData));

    if (uploadVerificationDocuments.fulfilled.match(resultAction)) {
      alert('تم تقديم طلب التحقق بنجاح! سيقوم المسؤول بمراجعة طلبك قريباً.');
      if (user?.id) {
        dispatch(getVerificationStatus(user.id));
      }
      if (isDialog && onSuccess) {
        onSuccess();
      }
    }
  };

  const getStatusIcon = (statusValue) => {
    const iconClass = "h-5 w-5";
    switch (statusValue) {
      case 'approved': return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'rejected': return <XCircle className={`${iconClass} text-red-500`} />;
      case 'pending': return <Clock className={`${iconClass} text-yellow-500`} />;
      default: return <AlertCircle className={`${iconClass} text-gray-500`} />;
    }
  };
  
  const getStatusText = (statusValue) => ({
    'approved': 'مقبول',
    'rejected': 'مرفوض',
    'pending': 'قيد المراجعة',
  }[statusValue] || 'غير محدد');
  
  const getStatusColor = (statusValue) => ({
    'approved': 'text-green-600 bg-green-50',
    'rejected': 'text-red-600 bg-red-50',
    'pending': 'text-yellow-600 bg-yellow-50',
  }[statusValue] || 'text-gray-600 bg-gray-50');

  useEffect(() => {
    if (!isDialog && user?.verification_status === 'approved') {
      navigate('/dashboard');
    }
  }, [user, navigate, isDialog]);

  if (!isDialog && !token) {
    return (
      <div className="min-h-screen bg-muted py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">يتطلب تسجيل الدخول</h2>
            <p className="text-muted-foreground mb-4">يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة.</p>
            <Button onClick={() => navigate('/login')}>تسجيل الدخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isDialog && user?.user_type === 'technician') {
    return (
      <div className="min-h-screen bg-muted py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">أنت بالفعل فني</h2>
            <p className="text-muted-foreground mb-4">حسابك مصنف كفني بالفعل.</p>
            <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formContent = (
    <div dir="rtl">
      {isError ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">خطأ في تحميل الخدمات</h2>
            <p className="text-muted-foreground mb-4">تعذر تحميل قائمة الخدمات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {!isDialog && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">طلب التحقق من الهوية</h1>
              <p className="text-muted-foreground">قدم المستندات المطلوبة لتصبح فنيًا معتمدًا.</p>
            </div>
          )}

          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription>
              <strong>ملاحظة:</strong> هذه الخدمة متاحة حالياً فقط للمقيمين في مصر.
            </AlertDescription>
          </Alert>

          {user && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">مرحباً، {user?.first_name || user?.email}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">نوع الحساب الحالي:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                    {user?.user_type === 'client' ? 'عميل' : 'آخر'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{verificationStatus.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user?.verification_status === 'approved' && (
            <Alert variant="success" className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>تم التحقق من هويتك بنجاح!</AlertDescription>
            </Alert>
          )}

          {(!verificationStatus || verificationStatus.verification_status === 'rejected') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات المهنية</CardTitle>
                  <CardDescription>أخبرنا عن خبراتك ومهاراتك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
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
                                <X className="w-3 h-3" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience_years">سنوات الخبرة *</Label>
                      <Input id="experience_years" type="number" min="0" max="50" {...register('experience_years', validationRules.experience_years)} />
                      {errors.experience_years && <p className="text-sm text-red-600 mt-1">{errors.experience_years.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="hourly_rate">السعر لكل ساعة (بالجنيه المصري) *</Label>
                      <Input id="hourly_rate" type="number" min="1" {...register('hourly_rate', validationRules.hourly_rate)} />
                      {errors.hourly_rate && <p className="text-sm text-red-600 mt-1">{errors.hourly_rate.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input id="address" {...register('address', validationRules.address)} />
                    {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="skills">المهارات *</Label>
                    <Input id="skills" {...register('skills', validationRules.skills)} placeholder="مثال: كهرباء، سباكة..." />
                    {errors.skills && <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">وصف الخدمات *</Label>
                    <textarea id="description" {...register('description', validationRules.description)} className="w-full min-h-[100px] p-3 border rounded-md" />
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المستندات المطلوبة</CardTitle>
                  <CardDescription>ارفع المستندات اللازمة للتحقق من هويتك وخبراتك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload
                    label="صورة بطاقة الهوية المصرية"
                    name="id_document"
                    fileName={documents.id_document?.name}
                    onFileChange={handleFileChange}
                    onFileRemove={() => handleFileRemove("id_document")}
                    required
                    accept="image/*,.pdf"
                    error={!documents.id_document && isSubmitting ? "صورة الهوية مطلوبة" : null}
                  />
                  <FileUpload
                    label="الشهادات والمؤهلات (اختياري)"
                    name="certificate_document"
                    fileName={documents.certificate_document?.name}
                    onFileChange={handleFileChange}
                    onFileRemove={() => handleFileRemove("certificate_document")}
                    accept="image/*,.pdf"
                  />
                  <FileUpload
                    label="معرض الأعمال (اختياري)"
                    name="portfolio_document"
                    fileName={documents.portfolio_document?.name}
                    onFileChange={handleFileChange}
                    onFileRemove={() => handleFileRemove("portfolio_document")}
                    accept="image/*,.pdf"
                  />
                </CardContent>
              </Card>

              {isUploading && <Progress value={uploadProgress} className="w-full" />}

              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError || 'حدث خطأ. حاول مرة أخرى.'}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isUploading || isSubmitting}>
                {isUploading ? "جارٍ الرفع..." : "تقديم طلب التحقق"}
              </Button>
            </form>
          )}

          {verificationStatus?.verification_status === 'pending' && (
            <Alert variant="warning" className="mt-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>طلبك قيد المراجعة. ستتلقى إشعارًا عند اكتمال المراجعة.</AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );

  if (isDialog) {
    return formContent;
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4 max-w-2xl">{formContent}</div>
    </div>
  );
}
