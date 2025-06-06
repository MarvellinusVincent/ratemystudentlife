const { pool } = require('../config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
  }
});

// Submit a Review
const submitReview = async (req, res) => {
  const {
    university_id,
    university_name,
    user_id = null,
    overall_rating,
    happiness_rating,
    academic_rating,
    professors_rating,
    difficulty_rating,
    opportunities_rating,
    social_life_rating,
    clubs_rating,
    athletics_rating,
    safety_rating,
    facilities_rating,
    internet_rating,
    location_rating,
    housing_rating,
    food_rating,
    transportation_rating,
    review_text,
    comments = null
  } = req.body;

  if (!university_id || !university_name || !overall_rating || !review_text) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: {
        required: ['university_id', 'university_name', 'overall_rating', 'review_text'],
        received: {
          university_id: !!university_id,
          university_name: !!university_name,
          overall_rating: !!overall_rating,
          review_text: !!review_text
        }
      }
    });
  }

  const validateRating = (rating, fieldName) => {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new Error(`${fieldName} must be between 1 and 5`);
    }
    return rating || null;
  };

  try {
    const validatedRatings = {
      overall_rating: validateRating(overall_rating, 'Overall rating'),
      happiness_rating: validateRating(happiness_rating, 'Happiness rating'),
      academic_rating: validateRating(academic_rating, 'Academic rating'),
      professors_rating: validateRating(professors_rating, 'Professors rating'),
      difficulty_rating: validateRating(difficulty_rating, 'Difficulty rating'),
      opportunities_rating: validateRating(opportunities_rating, 'Opportunities rating'),
      social_life_rating: validateRating(social_life_rating, 'Social life rating'),
      clubs_rating: validateRating(clubs_rating, 'Clubs rating'),
      athletics_rating: validateRating(athletics_rating, 'Athletics rating'),
      safety_rating: validateRating(safety_rating, 'Safety rating'),
      facilities_rating: validateRating(facilities_rating, 'Facilities rating'),
      internet_rating: validateRating(internet_rating, 'Internet rating'),
      location_rating: validateRating(location_rating, 'Location rating'),
      housing_rating: validateRating(housing_rating, 'Housing rating'),
      food_rating: validateRating(food_rating, 'Food rating'),
      transportation_rating: validateRating(transportation_rating, 'Transportation rating')
    };

    const result = await pool.query(
      `INSERT INTO reviews (
        user_id, university_id, university_name,
        overall_rating, happiness_rating,
        academic_rating, professors_rating, difficulty_rating, opportunities_rating,
        social_life_rating, clubs_rating, athletics_rating, safety_rating,
        facilities_rating, internet_rating,
        location_rating, housing_rating, food_rating, transportation_rating,
        review_text, comments
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING id`,
      [
        user_id,
        university_id,
        university_name,
        validatedRatings.overall_rating,
        validatedRatings.happiness_rating,
        validatedRatings.academic_rating,
        validatedRatings.professors_rating,
        validatedRatings.difficulty_rating,
        validatedRatings.opportunities_rating,
        validatedRatings.social_life_rating,
        validatedRatings.clubs_rating,
        validatedRatings.athletics_rating,
        validatedRatings.safety_rating,
        validatedRatings.facilities_rating,
        validatedRatings.internet_rating,
        validatedRatings.location_rating,
        validatedRatings.housing_rating,
        validatedRatings.food_rating,
        validatedRatings.transportation_rating,
        review_text.trim(),
        comments ? comments.trim() : null
      ]
    );
    res.status(200).json({
      success: true,
      message: 'Review submitted successfully',
      review_id: result.rows[0].id
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    if (err.message.includes('must be between 1 and 5')) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: err.message 
      });
    }
    res.status(500).json({ 
      error: 'Failed to submit review',
      message: err.message || 'Internal server error' 
    });
  }
};

// User likes a review
const submitLike = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to like reviews'
      });
    }
    
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT like_review($1, $2) as new_likes',
      [userId, id]
    );
    const likeStatus = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM review_likes WHERE user_id = $1 AND review_id = $2) as has_liked',
      [userId, id]
    );
    res.status(200).json({ 
      success: true,
      likes: result.rows[0].new_likes,
      hasLiked: likeStatus.rows[0].has_liked
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ 
      error: 'Failed to like review',
      message: error.message || 'Internal server error' 
    });
  }
}

// Check if the user has liked the review before
const checkIfLiked = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to check likes'
      });
    }
    
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM review_likes WHERE user_id = $1 AND review_id = $2) as has_liked',
      [userId, id]
    );
    res.status(200).json({ 
      hasLiked: result.rows[0].has_liked
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ 
      error: 'Failed to check like status',
      message: error.message || 'Internal server error' 
    });
  }
}

module.exports = { submitReview, submitLike, checkIfLiked };
