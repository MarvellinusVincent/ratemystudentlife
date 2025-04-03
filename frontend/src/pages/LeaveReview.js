import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContexts';

const LeaveReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const universityId = new URLSearchParams(location.search).get('id');
  const universityName = new URLSearchParams(location.search).get('name');

  const [formData, setFormData] = useState({
    academic_rating: '',
    professors_rating: '',
    difficulty_rating: '',
    opportunities_rating: '',
    internet_rating: '',
    safety_rating: '',
    social_life_rating: '',
    clubs_rating: '',
    facilities_rating: '',
    athletics_rating: '',
    location_rating: '',
    housing_rating: '',
    food_rating: '',
    transportation_rating: '',
    happiness_rating: '',
    overall_rating: '',
    review_text: '',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleStarClick = (field, rating) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: rating
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    for (const field in formData) {
      if (field !== 'comments' && formData[field] === '') {
        errors[field] = `${field.replace('_', ' ')} is required.`;
        isValid = false;
      }
    }

    setErrorMessages(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const userId = user ? user.id : -1;

    try {
      const response = await fetch(`http://localhost:1234/reviews/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          university_id: universityId,
          user_id: userId,
        }),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        navigate(`/university?name=${universityName}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const [hoverRatings, setHoverRatings] = useState({});

  const renderStars = (field) => {
    const currentRating = formData[field];
    const hoverRating = hoverRatings[field] || 0;
  
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <span
            key={rating}
            onClick={() => handleStarClick(field, rating)}
            onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [field]: rating }))}
            onMouseLeave={() => setHoverRatings((prev) => ({ ...prev, [field]: 0 }))}
            className={`cursor-pointer text-2xl ${
              rating <= (hoverRating || currentRating) ? 'text-yellow-400' : 'text-gray-300'
            } transition transform duration-200 hover:scale-110`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingCategory = (field, label, icon) => (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50 shadow-sm mb-4">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <h3 className="font-medium text-gray-800">{label}</h3>
      </div>
      {renderStars(field)}
      {errorMessages[field] && (
        <p className="text-red-500 text-sm mt-1">{errorMessages[field]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gradient-to-r from-pink-200 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-gradient-to-l from-blue-200 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-yellow-100 to-transparent opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-pink-50/30 opacity-30"></div>
          
          <div className="relative p-8 md:p-10">
            <div className="flex justify-start mb-6">
              <button
                onClick={() => navigate(`/university?name=${universityName}`)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to University
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-2">
              {universityName}
            </h1>
            <p className="text-gray-600 mb-6">
              Share your experience to help others
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Overall Rating */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Rating</h2>
                <div className="flex justify-center">
                  <div className="text-center">
                    {renderStars('overall_rating')}
                    {errorMessages.overall_rating && (
                      <p className="text-red-500 text-sm mt-1">{errorMessages.overall_rating}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Academics Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Academics</h3>
                  {renderRatingCategory('academic_rating', 'Academic', '📚')}
                  {renderRatingCategory('professors_rating', 'Professors', '👨‍🏫')}
                  {renderRatingCategory('difficulty_rating', 'Difficulty', '🧠')}
                  {renderRatingCategory('opportunities_rating', 'Opportunities', '💼')}
                  {renderRatingCategory('internet_rating', 'Internet', '🌐')}
                </div>

                {/* Campus Life Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Campus Life</h3>
                  {renderRatingCategory('safety_rating', 'Safety', '👮‍♂️')}
                  {renderRatingCategory('social_life_rating', 'Social Life', '🎉')}
                  {renderRatingCategory('clubs_rating', 'Clubs', '🎭')}
                  {renderRatingCategory('facilities_rating', 'Facilities', '🏛️')}
                  {renderRatingCategory('athletics_rating', 'Athletics', '🏈')}
                </div>

                {/* Living Column */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Living</h3>
                  {renderRatingCategory('location_rating', 'Location', '📍')}
                  {renderRatingCategory('housing_rating', 'Housing', '🏠')}
                  {renderRatingCategory('food_rating', 'Food', '🍕')}
                  {renderRatingCategory('transportation_rating', 'Transportation', '🚌')}
                  {renderRatingCategory('happiness_rating', 'Happiness', '🌞')}
                </div>
              </div>

              {/* Review Text (unchanged as requested) */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Review</h2>
                <textarea
                  name="review_text"
                  value={formData.review_text}
                  onChange={handleInputChange}
                  rows="5"
                  required
                  className="w-full p-4 bg-white/80 border border-gray-200/70 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Share your detailed experience..."
                />
                {errorMessages.review_text && (
                  <p className="text-red-500 text-sm mt-1">{errorMessages.review_text}</p>
                )}
              </div>

              {/* Additional Comments */}
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Comments</h2>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-4 bg-white/80 border border-gray-200/70 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Any other thoughts you'd like to share..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReview;