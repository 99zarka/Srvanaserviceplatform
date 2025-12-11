import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableOrders } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';

const PublicProjectsList = () => {
  const dispatch = useDispatch();
  const { availableOrders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getAvailableOrders());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-8">جاري تحميل المشاريع المتاحة...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">خطأ: {error.message || 'فشل في جلب المشاريع'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">المشاريع المتاحة للفنيين</h1>
      {availableOrders.length === 0 ? (
        <p className="text-gray-600">لا توجد مشاريع متاحة حاليًا للعروض.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{order.service?.arabic_name || 'غير متوفر'}</h2>
              <p className="text-gray-600 mb-4">{order.problem_description.substring(0, 100)}...</p>
              <div className="flex items-center text-gray-500 text-sm mb-2">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {order.requested_location}
              </div>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {order.scheduled_date} الساعة {order.scheduled_time_start}
              </div>
              {order.expected_price && (
                <div className="text-lg font-bold text-blue-600 mb-4">
                  السعر المتوقع: ${order.expected_price}
                </div>
              )}
              <div className="flex gap-3">
                <Link
                  to={`/projects/${order.order_id}`}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition duration-300 hover:scale-105 hover:shadow-lg transform text-center"
                >
                  عرض التفاصيل
                </Link>
                <Link
                  to={`/projects/${order.order_id}/offer`}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition duration-300 hover:scale-105 hover:shadow-lg transform text-center"
                >
                  قدم عرض
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProjectsList;
