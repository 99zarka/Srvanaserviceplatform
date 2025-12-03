import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Star, 
  MapPin, 
  Clock, 
  Wrench, 
  User, 
  DollarSign, 
  CheckCircle, 
  Calendar,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail
} from 'lucide-react';
import { createOrder } from '../../redux/orderSlice';
import { format } from 'date-fns';

// Form validation schema
const hireSchema = z.object({
  service: z.string().min(1, 'Please select a service'),
  problem_description: z.string().min(10, 'Description must be at least 10 characters'),
  requested_location: z.string().min(5, 'Please provide a valid location'),
  scheduled_date: z.date({ required_error: 'Please select a date' }),
  scheduled_time_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  scheduled_time_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  budget: z.string().min(1, 'Please provide your budget'),
  urgent_service: z.boolean().default(false),
});

const DirectHireFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMessage } = useSelector((state) => state.orders);
  
  const selectedTechnician = location.state?.technician;
  const [currentStep, setCurrentStep] = useState(1);
  const [services] = useState([
    { service_id: 1, service_name: 'Plumbing', category: { category_name: 'Home Services' } },
    { service_id: 2, service_name: 'Electrical', category: { category_name: 'Home Services' } },
    { service_id: 3, service_name: 'HVAC', category: { category_name: 'Home Services' } },
    { service_id: 4, service_name: 'Cleaning', category: { category_name: 'Home Services' } },
  ]);
  const [selectedDate, setSelectedDate] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(hireSchema),
  });

  if (!selectedTechnician) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No technician selected</h3>
            <p className="text-gray-600 mb-4">Please select a technician to start the hiring process</p>
            <Button onClick={() => navigate('/technician-browse')}>
              Browse Technicians
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      const orderData = {
        service: data.service,
        problem_description: data.problem_description,
        requested_location: data.requested_location,
        scheduled_date: data.scheduled_date.toISOString().split('T')[0],
        scheduled_time_start: data.scheduled_time_start,
        scheduled_time_end: data.scheduled_time_end,
        order_type: 'direct_hire',
        creation_timestamp: new Date().toISOString().split('T')[0],
        budget: data.budget,
        urgent_service: data.urgent_service,
        technician_user: selectedTechnician.user_id,
      };

      const result = await dispatch(createOrder(orderData));
      
      if (result && !result.error) {
        setCurrentStep(4); // Success step
      }
    } catch (error) {
      console.error('Failed to create direct hire order:', error);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step < currentStep ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              step
            )}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/technician-browse')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
        <h1 className="text-3xl font-bold">Direct Hire: {selectedTechnician.first_name}</h1>
        <p className="text-gray-600">Book {selectedTechnician.first_name} {selectedTechnician.last_name} directly</p>
      </div>

      <StepIndicator />

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Service Details</CardTitle>
            <CardDescription>
              Tell us what service you need
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(nextStep)} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Select onValueChange={(value) => setValue('service', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {(services || []).map((service) => (
                      <SelectItem key={service.service_id} value={service.service_id.toString()}>
                        {service.service_name} - {service.category?.category_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-sm text-red-600">{errors.service.message}</p>
                )}
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="problem_description">Describe Your Issue</Label>
                <Textarea
                  id="problem_description"
                  placeholder="Describe what needs to be fixed or installed..."
                  className="min-h-[120px]"
                  {...register('problem_description')}
                />
                {errors.problem_description && (
                  <p className="text-sm text-red-600">{errors.problem_description.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="requested_location">Service Location</Label>
                <Input
                  id="requested_location"
                  placeholder="123 Main St, Cairo, Egypt"
                  {...register('requested_location')}
                />
                {errors.requested_location && (
                  <p className="text-sm text-red-600">{errors.requested_location.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Schedule & Budget</CardTitle>
            <CardDescription>
              When do you need the service and what's your budget?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(nextStep)} className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                    setValue('scheduled_date', tomorrow);
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
                {errors.scheduled_date && (
                  <p className="text-sm text-red-600">{errors.scheduled_date.message}</p>
                )}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time_start">Start Time</Label>
                  <Input
                    id="scheduled_time_start"
                    type="time"
                    {...register('scheduled_time_start')}
                  />
                  {errors.scheduled_time_start && (
                    <p className="text-sm text-red-600">{errors.scheduled_time_start.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time_end">End Time</Label>
                  <Input
                    id="scheduled_time_end"
                    type="time"
                    {...register('scheduled_time_end')}
                  />
                  {errors.scheduled_time_end && (
                    <p className="text-sm text-red-600">{errors.scheduled_time_end.message}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget">Your Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 150"
                  {...register('budget')}
                />
                {errors.budget && (
                  <p className="text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              {/* Urgent Service */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgent_service"
                  {...register('urgent_service')}
                />
                <Label htmlFor="urgent_service">This is an urgent service</Label>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button type="submit">
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Review & Confirm</CardTitle>
            <CardDescription>
              Review your booking details before confirming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Technician Info */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Your Selected Technician</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {selectedTechnician.first_name} {selectedTechnician.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedTechnician.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(selectedTechnician.overall_rating || 0)}
                      <span className="text-sm ml-1">
                        {selectedTechnician.overall_rating?.toFixed(1) || '0.0'} ({selectedTechnician.num_jobs_completed || 0} jobs)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Summary */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Service Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>
                    <p>{services.find(s => s.service_id.toString() === watch('service'))?.service_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>
                    <p>{watch('scheduled_time_start')} - {watch('scheduled_time_end')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span>
                    <p>${watch('budget')}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Location:</span>
                    <p>{watch('requested_location')}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span>
                    <p>{watch('problem_description')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your direct hire request has been sent to {selectedTechnician.first_name}. 
              You will receive a confirmation once they accept the booking.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                View My Orders
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && currentStep < 4 && (
        <div className="mt-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && currentStep < 4 && (
        <div className="mt-6 p-4 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DirectHireFlow;
