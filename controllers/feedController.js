const ContentFeed = require('../models/ContentFeed');
const User = require('../models/User');
const { catchAsync } = require('../middleware/errorHandler');

// Get all feed posts
const getFeedPosts = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const posts = await ContentFeed.find()
    .populate({
      path: 'userId',
      select: 'name profileImage'
    })
    .populate({
      path: 'comments.userId',
      select: 'name profileImage'
    })
    .sort({ timestamp: -1 })
    .limit(50);

  // Add isLiked status for each post
  const postsWithLikeStatus = posts.map(post => {
    const postObj = post.toObject();
    postObj.isLiked = post.likes.includes(userId);
    
    // Debug: Log comment structure
    if (post.comments && post.comments.length > 0) {
      console.log('Post comments:', post.comments.map(c => ({
        userId: c.userId,
        text: c.text,
        hasUserId: !!c.userId,
        userIdType: typeof c.userId
      })));
    }
    
    return postObj;
  });

  res.status(200).json({
    success: true,
    data: postsWithLikeStatus
  });
});

// Create a new feed post
const createFeedPost = catchAsync(async (req, res) => {
  const { text, locationTag, images } = req.body;
  const userId = req.user.id;

  const newPost = new ContentFeed({
    userId,
    type: 'Post',
    text,
    locationTag,
    images: images || [],
    likes: [],
    timestamp: new Date()
  });

  const savedPost = await newPost.save();
  await savedPost.populate('userId', 'name profileImage');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: savedPost
  });
});

// Like/Unlike a post
const toggleLike = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const post = await ContentFeed.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const isLiked = post.likes.includes(userId);
  
  if (isLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: isLiked ? 'Post unliked' : 'Post liked',
    data: {
      isLiked: !isLiked,
      likesCount: post.likes.length
    }
  });
});

// Add comment to a post
const addComment = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  const post = await ContentFeed.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const user = await User.findById(userId).select('name profileImage');
  
  const comment = {
    userId,
    text,
    timestamp: new Date()
  };

  post.comments = post.comments || [];
  post.comments.push(comment);
  await post.save();

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      comment: {
        ...comment,
        user: {
          name: user.name,
          profileImage: user.profileImage
        }
      },
      commentsCount: post.comments.length
    }
  });
});

// Get comments for a post
const getPostComments = catchAsync(async (req, res) => {
  const { postId } = req.params;

  const post = await ContentFeed.findById(postId)
    .populate({
      path: 'comments.userId',
      select: 'name profileImage'
    })
    .select('comments');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  res.status(200).json({
    success: true,
    data: post.comments || []
  });
});

// Save/Unsave a post
const toggleSave = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  // This would typically be stored in a separate SavedPosts model
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Post save status toggled'
  });
});

// Delete a post
const deletePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const post = await ContentFeed.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check if user owns the post
  if (post.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this post'
    });
  }

  await ContentFeed.findByIdAndDelete(postId);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

module.exports = {
  getFeedPosts,
  createFeedPost,
  toggleLike,
  addComment,
  getPostComments,
  toggleSave,
  deletePost
};
