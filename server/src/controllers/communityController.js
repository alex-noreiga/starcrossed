const { ApiError } = require('../utils/errorHandler');
const chartService = require('../services/chartService');
const userService = require('../services/auth/userService');
const mongoose = require('mongoose');
const ForumCategory = require('../models/ForumCategory');

/**
 * Controller for community and sharing features
 */
class CommunityController {
  /**
   * Update user profile visibility
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateProfileVisibility(req, res, next) {
    try {
      const { isPublic, bio, professionalTitle, location, socialLinks } = req.body;
      
      // Validate social links if provided
      if (socialLinks) {
        if (!Array.isArray(socialLinks)) {
          throw new ApiError(400, 'Social links must be an array');
        }
        
        socialLinks.forEach(link => {
          if (!link.platform || !link.url) {
            throw new ApiError(400, 'Each social link must have platform and url properties');
          }
        });
      }
      
      // Update user profile
      const user = await userService.updateUserProfile(req.user.id, {
        isPublic: isPublic !== undefined ? isPublic : req.user.isPublic,
        bio: bio || req.user.bio,
        professionalTitle: professionalTitle || req.user.professionalTitle,
        location: location || req.user.location,
        socialLinks: socialLinks || req.user.socialLinks
      });
      
      res.status(200).json({
        success: true,
        data: {
          isPublic: user.isPublic,
          bio: user.bio,
          professionalTitle: user.professionalTitle,
          location: user.location,
          socialLinks: user.socialLinks
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get public profiles
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getPublicProfiles(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      // Create filter for public profiles
      const filter = { isPublic: true };
      
      // Add search filter if provided
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { professionalTitle: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get public profiles
      const profiles = await userService.getUserProfiles(filter, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get public profile by username
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getPublicProfile(req, res, next) {
    try {
      const { username } = req.params;
      
      // Get user by username
      const user = await userService.getUserByUsername(username);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Check if profile is public
      if (!user.isPublic) {
        throw new ApiError(403, 'This profile is not public');
      }
      
      // Get user's public charts
      const charts = await chartService.getPublicChartsByUserId(user._id);
      
      res.status(200).json({
        success: true,
        data: {
          username: user.username,
          bio: user.bio,
          professionalTitle: user.professionalTitle,
          location: user.location,
          socialLinks: user.socialLinks,
          charts: charts
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update chart visibility and sharing settings
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateChartVisibility(req, res, next) {
    try {
      const { chartId } = req.params;
      const { isPublic, allowComments } = req.body;
      
      // Get chart
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      // Verify user owns this chart
      if (chart.userId.toString() !== req.user.id) {
        throw new ApiError(403, 'You do not have permission to update this chart');
      }
      
      // Update chart
      const updatedChart = await chartService.updateChart(chartId, {
        isPublic: isPublic !== undefined ? isPublic : chart.isPublic,
        allowComments: allowComments !== undefined ? allowComments : chart.allowComments
      });
      
      res.status(200).json({
        success: true,
        data: {
          id: updatedChart._id,
          name: updatedChart.name,
          isPublic: updatedChart.isPublic,
          allowComments: updatedChart.allowComments
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Add comment to a chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async addChartComment(req, res, next) {
    try {
      const { chartId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        throw new ApiError(400, 'Comment content is required');
      }
      
      // Get chart
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      // Check if chart is public or user owns it
      if (!chart.isPublic && chart.userId.toString() !== req.user.id) {
        throw new ApiError(403, 'You do not have permission to comment on this chart');
      }
      
      // Check if comments are allowed
      if (!chart.allowComments) {
        throw new ApiError(403, 'Comments are not allowed for this chart');
      }
      
      // Create comment
      const comment = {
        userId: mongoose.Types.ObjectId(req.user.id),
        username: req.user.username,
        content,
        createdAt: new Date()
      };
      
      // Add comment to chart
      const updatedChart = await chartService.addComment(chartId, comment);
      
      res.status(201).json({
        success: true,
        data: updatedChart.comments[updatedChart.comments.length - 1]
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get chart comments
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getChartComments(req, res, next) {
    try {
      const { chartId } = req.params;
      
      // Get chart
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      // Check if chart is public or user owns it
      if (!chart.isPublic && chart.userId.toString() !== req.user.id) {
        throw new ApiError(403, 'You do not have permission to view comments on this chart');
      }
      
      res.status(200).json({
        success: true,
        data: chart.comments || []
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete chart comment
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteChartComment(req, res, next) {
    try {
      const { chartId, commentId } = req.params;
      
      // Get chart
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      // Find comment
      const comment = chart.comments.find(c => c._id.toString() === commentId);
      
      if (!comment) {
        throw new ApiError(404, 'Comment not found');
      }
      
      // Check if user is comment author or chart owner
      if (comment.userId.toString() !== req.user.id && chart.userId.toString() !== req.user.id) {
        throw new ApiError(403, 'You do not have permission to delete this comment');
      }
      
      // Remove comment from chart
      const updatedChart = await chartService.removeComment(chartId, commentId);
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get forum categories
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getForumCategories(req, res, next) {
    try {
      // Get forum categories
      const categories = await ForumCategory.find()
        .sort({ order: 1 })
        .populate('lastPost', 'title author createdAt');
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Generate social media sharing link
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async generateSharingLink(req, res, next) {
    try {
      const { chartId, platform } = req.body;
      
      if (!chartId || !platform) {
        throw new ApiError(400, 'Chart ID and platform are required');
      }
      
      // Get chart
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      // Verify user owns this chart or chart is public
      if (chart.userId.toString() !== req.user.id && !chart.isPublic) {
        throw new ApiError(403, 'You do not have permission to share this chart');
      }
      
      // Generate chart sharing URL
      const baseUrl = process.env.FRONTEND_URL || 'https://starcrossed.app';
      const sharingUrl = `${baseUrl}/chart/${chartId}`;
      
      // Generate platform-specific sharing links
      let sharingLink;
      
      switch (platform.toLowerCase()) {
        case 'twitter':
          sharingLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(sharingUrl)}&text=${encodeURIComponent(`Check out this birth chart for ${chart.name} on Starcrossed!`)}`;
          break;
        case 'facebook':
          sharingLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharingUrl)}`;
          break;
        case 'instagram':
          // Instagram doesn't support direct link sharing, return just the URL
          sharingLink = sharingUrl;
          break;
        case 'email':
          sharingLink = `mailto:?subject=${encodeURIComponent(`Birth Chart for ${chart.name}`)}&body=${encodeURIComponent(`Check out this birth chart on Starcrossed: ${sharingUrl}`)}`;
          break;
        default:
          sharingLink = sharingUrl;
      }
      
      res.status(200).json({
        success: true,
        data: {
          platform,
          url: sharingLink,
          baseUrl: sharingUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunityController();
