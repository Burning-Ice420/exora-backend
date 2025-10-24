# WanderBlocks API Testing Guide

## Overview
This guide provides comprehensive instructions for testing the WanderBlocks backend API using the provided Postman collection.

## Prerequisites
1. **Backend Server Running**: Ensure the WanderBlocks backend is running on `http://localhost:5000`
2. **Postman Installed**: Download and install Postman from [postman.com](https://www.postman.com/)
3. **Database**: MongoDB should be running and accessible

## Setup Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `WanderBlocks_API.postman_collection.json` file
4. The collection will be imported with all endpoints organized in folders

### 2. Environment Variables
The collection uses the following variables:
- `baseUrl`: Set to `http://localhost:5000` (default)
- `authToken`: Automatically set after successful login/signup
- `userId`: Automatically set after successful login/signup

### 3. Testing Workflow

#### Step 1: Health Check
- Run the "API Health Check" request to verify the server is running
- Expected response: `200 OK` with server status

#### Step 2: Authentication Flow
1. **User Signup**: Create a new user account
   - The `authToken` and `userId` variables will be automatically set
   - Expected response: `201 Created` with user data and JWT token

2. **User Login**: Test login with existing credentials
   - Variables will be updated with new token
   - Expected response: `200 OK` with user data and JWT token

3. **Get Current User**: Test authenticated endpoint
   - Uses the stored `authToken`
   - Expected response: `200 OK` with current user profile

#### Step 3: Core Functionality Testing

**Itineraries:**
1. Create a new itinerary
2. Get user's itineraries
3. Get public itineraries
4. Clone an existing itinerary (replace `ITINERARY_ID_HERE` with actual ID)

**Blocks:**
1. Create a new block for an itinerary
2. Get blocks for a specific itinerary
3. Get block recommendations with filters
4. Update a block (replace `BLOCK_ID_HERE` with actual ID)
5. Delete a block

**Map & Location:**
1. Get nearby users with various filters
2. Test different location coordinates and radius values

**Feed:**
1. Get user feed based on location and interests
2. Create a new feed post

**Requests:**
1. Send a join request to another user's block
2. Get user's requests (all, sent, received)
3. Update request status (accept/reject)

#### Step 4: Error Testing
Test various error scenarios:
- Invalid login credentials
- Missing required fields
- Unauthorized access without token
- Invalid JWT token

## API Endpoints Summary

### Authentication (`/api/users`)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `GET /:id` - Get user by ID
- `PUT /me` - Update current user

### Itineraries (`/api/itineraries`)
- `POST /create` - Create new itinerary
- `GET /user/:userId` - Get user's itineraries
- `GET /public` - Get public itineraries
- `POST /clone/:itineraryId` - Clone itinerary

### Blocks (`/api/blocks`)
- `POST /create` - Create new block
- `GET /itinerary/:itineraryId` - Get blocks for itinerary
- `GET /recommend` - Get block recommendations
- `PUT /:id` - Update block
- `DELETE /:id` - Delete block

### Map (`/api/map`)
- `GET /nearby` - Get nearby users with filters

### Feed (`/api/feed`)
- `GET /` - Get user feed
- `POST /` - Create feed post

### Requests (`/api/requests`)
- `POST /send` - Send join request
- `GET /user/:userId` - Get user's requests
- `PATCH /:id` - Update request status

## Testing Tips

### 1. Sequential Testing
Run requests in the suggested order to build up test data:
1. Health Check
2. Signup/Login
3. Create Itinerary
4. Create Blocks
5. Test other features

### 2. Data Dependencies
- Replace placeholder IDs (`ITINERARY_ID_HERE`, `BLOCK_ID_HERE`, etc.) with actual IDs from previous requests
- Use the `userId` variable for user-specific endpoints

### 3. Authentication
- Most endpoints require authentication
- The collection automatically handles token management
- Test both authenticated and unauthenticated scenarios

### 4. Error Scenarios
- Test with invalid data
- Test rate limiting (make multiple rapid requests)
- Test with missing required fields

## Expected Response Formats

### Success Responses
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Responses
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Rate Limiting
The API implements rate limiting:
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Security Features
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers

## Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure backend server is running
2. **Authentication Errors**: Check if token is valid and not expired
3. **Validation Errors**: Ensure all required fields are provided
4. **Database Errors**: Check MongoDB connection

### Debug Steps
1. Check server logs
2. Verify environment variables
3. Test with curl commands
4. Check network connectivity

## Performance Testing
- Test with multiple concurrent requests
- Monitor response times
- Test with large datasets
- Verify rate limiting works correctly

## Security Testing
- Test with invalid tokens
- Test SQL injection attempts
- Test XSS payloads
- Test CSRF protection

This collection provides comprehensive coverage of all WanderBlocks API endpoints and scenarios.
