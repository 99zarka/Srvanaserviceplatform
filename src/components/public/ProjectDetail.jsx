import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicOrderDetail, createProjectOffer, updateProjectOffer } from '../../redux/orderSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProjectDetail = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, token } = useSelector((state) => state.auth);
  const { currentViewingOrder: orderData, loading, error } = useSelector((state) => state.orders);

  // Extract order and project offers from the response
  const selectedOrder = orderData?.order || orderData;
  const projectOffers = orderData?.project_offers || [];

  const [offerPrice, setOfferPrice] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (order_id) {
      dispatch(fetchPublicOrderDetail(order_id));
    }
  }, [dispatch, order_id]);

  const isTechnician = currentUser?.user_type === 'technician' || currentUser?.user_type === 'worker';
  const hasAlreadyOffered = selectedOrder?.project_offers?.some(
    (offer) => offer.technician_user === currentUser?.user_id
  );

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerPrice || !offerDescription) {
      toast.error('يرجى تقديم كل من سعر العرض ووصفه.');
      return;
    }
    if (!currentUser || !currentUser.user_id) {
      toast.error('يجب أن تكون مسجلاً دخولك لإرسال عرض.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createProjectOffer({
        order: order_id,
        offered_price: parseFloat(offerPrice),
        offer_description: offerDescription,
        technician_user: currentUser.user_id, // Ensure technician_user is sent
      })).unwrap();
      toast.success('تم إرسال العرض بنجاح!');
      setOfferPrice('');
      setOfferDescription('');
      // Optionally refresh the order to show the new offer immediately
      dispatch(fetchPublicOrderDetail(order_id));
    } catch (err) {
      const errorMessage = err.message || 'فشل في إرسال العرض.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري تحميل تفاصيل المشروع...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">خطأ: {error.message || 'فشل في جلب تفاصيل المشروع'}</div>;
  }

  if (!selectedOrder) {
    return <div className="text-center py-8 text-gray-600">المشروع غير موجود أو لا توجد بيانات.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <button
        onClick={() => navigate('/projects')}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        العودة إلى المشاريع &rarr;
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">{selectedOrder.service?.arabic_name || 'مشروع خدمة'}</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <p className="text-gray-700 text-lg mb-4">{selectedOrder.problem_description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-4">
          <div>
            <strong className="block text-gray-800">العميل:</strong>
            {selectedOrder.client_user?.first_name} {selectedOrder.client_user?.last_name}
          </div>
          <div>
            <strong className="block text-gray-800">الموقع:</strong>
            {selectedOrder.requested_location}
          </div>
          <div>
            <strong className="block text-gray-800">التاريخ المحدد:</strong>
            {selectedOrder.scheduled_date}
          </div>
          <div>
            <strong className="block text-gray-800">الوقت:</strong>
            {selectedOrder.scheduled_time_start} - {selectedOrder.scheduled_time_end}
          </div>
          {selectedOrder.expected_price && (
            <div>
              <strong className="block text-gray-800">السعر المتوقع:</strong>
              <span className="text-blue-600 font-semibold">${selectedOrder.expected_price}</span>
            </div>
          )}
          <div>
            <strong className="block text-gray-800">الحالة:</strong>
            <span className="capitalize">{selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {isTechnician && selectedOrder.order_status === 'OPEN' && !hasAlreadyOffered && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">قدم عرضًا</h2>
          <form onSubmit={handleSubmitOffer}>
            <div className="mb-4">
              <label htmlFor="offerPrice" className="block text-gray-700 text-sm font-bold mb-2">
                سعر عرضك ($)
              </label>
              <input
                type="number"
                id="offerPrice"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="مثل 150.00"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="offerDescription" className="block text-gray-700 text-sm font-bold mb-2">
                وصف العرض
              </label>
              <textarea
                id="offerDescription"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="وصف نهجك، توافرك، أو أي تفاصيل أخرى ذات صلة."
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال العرض'}
            </button>
          </form>
        </div>
      )}

      {isTechnician && hasAlreadyOffered && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
          <p className="font-bold">تم إرسال العرض</p>
          <p>لقد قدمت عرضًا بالفعل لهذا المشروع.</p>
        </div>
      )}

      {!isTechnician && currentUser && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">ليست فنيًا</p>
          <p>فقط الفنيون يمكنهم تقديم عروض على المشاريع.</p>
        </div>
      )}

      {!currentUser && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">سجل الدخول للعرض</p>
          <p>يرجى تسجيل الدخول بحساب فني لتقديم عرض على هذا المشروع.</p>
        </div>
      )}

      {selectedOrder.order_status !== 'OPEN' && (isTechnician || currentUser) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">المشروع غير مفتوح</p>
          <p>هذا المشروع لم يعد مفتوحًا للعروض (الحالة الحالية: {selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}).</p>
        </div>
      )}

      {/* Display existing offers for this project */}
      {projectOffers && projectOffers.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">العروض الموجودة</h2>
          <div className="space-y-6">
            {projectOffers.map((offer) => (
              <div key={offer.offer_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">${offer.offered_price}</p>
                    <p className="text-gray-600">{offer.offer_description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">العرض #{offer.offer_id}</p>
                    <p className="text-sm text-gray-500">الحالة: <span className="capitalize">{offer.status?.toLowerCase().replace(/_/g, ' ')}</span></p>
                    <p className="text-sm text-gray-500">التاريخ: {offer.offer_date}</p>
                  </div>
                </div>
                {offer.technician_user && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                        <span className="text-gray-600 font-medium">
                          {offer.technician_user.first_name?.charAt(0)}{offer.technician_user.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {offer.technician_user.first_name} {offer.technician_user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">فني</p>
                      </div>
                    </div>
                    {/* Show edit button for technician's own offers */}
                    {isTechnician && currentUser?.user_id === offer.technician_user.user_id && offer.status === 'pending' && (
                      <button
                        onClick={() => {
                          setEditingOffer(offer);
                          setEditPrice(offer.offered_price);
                          setEditDescription(offer.offer_description);
                          setIsEditing(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        تحرير العرض
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      {isEditing && editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" dir="rtl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">تحرير عرضك</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // Handle edit form submission
                if (!editPrice || !editDescription) {
                  toast.error('يرجى تقديم كل من سعر العرض ووصفه.');
                  return;
                }

                try {
                  await dispatch(updateProjectOffer({
                    offerId: editingOffer.offer_id,
                    offerData: {
                      offered_price: parseFloat(editPrice),
                      offer_description: editDescription
                    }
                  })).unwrap();

                  toast.success('تم تحديث العرض بنجاح!');
                  setIsEditing(false);
                  // Refresh the order to show the updated offer
                  dispatch(fetchPublicOrderDetail(order_id));
                } catch (err) {
                  const errorMessage = err.message || 'فشل في تحديث العرض.';
                  toast.error(errorMessage);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="editPrice" className="block text-gray-700 text-sm font-bold mb-2">
                  سعر العرض ($)
                </label>
                <input
                  type="number"
                  id="editPrice"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="editDescription" className="block text-gray-700 text-sm font-bold mb-2">
                  وصف العرض
                </label>
                <textarea
                  id="editDescription"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  تحديث العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
