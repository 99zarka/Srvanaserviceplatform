import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicOrderDetail, createProjectOffer } from '../../redux/orderSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProjectDetail = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, token } = useSelector((state) => state.auth);
  const { currentViewingOrder: selectedOrder, loading, error } = useSelector((state) => state.orders);

  const [offerPrice, setOfferPrice] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error('Please provide both an offer price and description.');
      return;
    }
    if (!currentUser || !currentUser.user_id) {
      toast.error('You must be logged in to submit an offer.');
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
      toast.success('Offer submitted successfully!');
      setOfferPrice('');
      setOfferDescription('');
      // Optionally refresh the order to show the new offer immediately
      dispatch(fetchPublicOrderDetail(order_id)); 
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit offer.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading project details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error.message || 'Failed to fetch project details'}</div>;
  }

  if (!selectedOrder) {
    return <div className="text-center py-8 text-gray-600">Project not found or no data.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/projects')} 
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        &larr; Back to Projects
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">{selectedOrder.service?.name || 'Service Project'}</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <p className="text-gray-700 text-lg mb-4">{selectedOrder.problem_description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-4">
          <div>
            <strong className="block text-gray-800">Client:</strong> 
            {selectedOrder.client_user?.first_name} {selectedOrder.client_user?.last_name}
          </div>
          <div>
            <strong className="block text-gray-800">Location:</strong> 
            {selectedOrder.requested_location}
          </div>
          <div>
            <strong className="block text-gray-800">Scheduled Date:</strong> 
            {selectedOrder.scheduled_date}
          </div>
          <div>
            <strong className="block text-gray-800">Time:</strong> 
            {selectedOrder.scheduled_time_start} - {selectedOrder.scheduled_time_end}
          </div>
          {selectedOrder.expected_price && (
            <div>
              <strong className="block text-gray-800">Expected Price:</strong> 
              <span className="text-blue-600 font-semibold">${selectedOrder.expected_price}</span>
            </div>
          )}
          <div>
            <strong className="block text-gray-800">Status:</strong> 
            <span className="capitalize">{selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {isTechnician && selectedOrder.order_status === 'OPEN' && !hasAlreadyOffered && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Make an Offer</h2>
          <form onSubmit={handleSubmitOffer}>
            <div className="mb-4">
              <label htmlFor="offerPrice" className="block text-gray-700 text-sm font-bold mb-2">
                Your Offer Price ($)
              </label>
              <input
                type="number"
                id="offerPrice"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., 150.00"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="offerDescription" className="block text-gray-700 text-sm font-bold mb-2">
                Offer Description
              </label>
              <textarea
                id="offerDescription"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="Describe your approach, availability, or any other relevant details."
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
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </button>
          </form>
        </div>
      )}

      {isTechnician && hasAlreadyOffered && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
          <p className="font-bold">Offer Submitted</p>
          <p>You have already submitted an offer for this project.</p>
        </div>
      )}

      {!isTechnician && currentUser && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Not a Technician</p>
          <p>Only technicians can make offers on projects.</p>
        </div>
      )}

      {!currentUser && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Sign In to Offer</p>
          <p>Please sign in with a technician account to make an offer on this project.</p>
        </div>
      )}

      {selectedOrder.order_status !== 'OPEN' && (isTechnician || currentUser) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Project Not Open</p>
          <p>This project is no longer open for offers (Current Status: {selectedOrder.order_status?.toLowerCase().replace(/_/g, ' ')}).</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
