# Family & Travel Type Backend Implementation

## Overview

This implementation adds family-based sub-travel approval workflows and user travel-type logic to the WanderBlocks backend. Users can now be categorized as solo travelers, couples, or families, with different capabilities for each type.

## Features Implemented

### 1. User Travel Types
- **Solo Traveler**: Standard individual travel planning
- **Couple**: Two-person travel with partner approval workflow
- **Family**: Multi-person travel with family member approval workflow

### 2. Family Member Management
- Family members can be added during signup
- Each member has a status (pending/approved) and relation
- Head of family controls approval workflow

### 3. Block Types
- **Main Blocks**: Primary travel destinations created by head of family
- **Sub-Blocks**: Suggested destinations by family members requiring approval

## Database Schema Changes

### User Model Updates
```javascript
{
  travel_type: {
    type: String,
    enum: ["solo_traveler", "couple", "family"],
    default: "solo_traveler"
  },
  family_members: [{
    name: String,
    email: String,
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    relation: String
  }]
}
```

### Block Model Updates
```javascript
{
  createdBy: ObjectId, // User who created the block
  title: String,
  destination: String,
  radius: Number, // Exploration radius in km
  type: String, // "main_block" or "sub_block"
  approved: Boolean, // false if waiting for approval
  parentBlockId: ObjectId, // Links sub-blocks to main blocks
  membersInvolved: [ObjectId], // Array of user IDs
  suggestedBy: ObjectId // Who suggested this destination
}
```

## API Endpoints

### Authentication
- **POST** `/api/users/signup` - Enhanced to accept `travel_type` and `family_members`
- **POST** `/api/users/login` - Returns `travel_type` in response

### Block Management
- **POST** `/api/blocks` - Create main block
- **POST** `/api/blocks/suggest` - Suggest sub-block (family members only)
- **PATCH** `/api/blocks/approve/:subBlockId` - Approve/reject sub-block (head of family only)
- **GET** `/api/blocks/my-blocks` - Get all blocks for current user
- **GET** `/api/blocks/:blockId/sub-blocks` - Get sub-blocks for a main block

## Usage Examples

### 1. Family Signup
```json
POST /api/users/signup
{
  "name": "Rohit Sharma",
  "email": "rohit@gmail.com",
  "password": "123456",
  "travel_type": "family",
  "family_members": [
    {
      "name": "Neha Sharma",
      "email": "neha@gmail.com",
      "relation": "wife"
    },
    {
      "name": "Aarav Sharma",
      "email": "aarav@gmail.com",
      "relation": "son"
    }
  ]
}
```

### 2. Create Main Block
```json
POST /api/blocks
{
  "title": "Family Trip to Paris",
  "destination": "Paris, France",
  "radius": 10,
  "membersInvolved": ["userId1", "userId2"]
}
```

### 3. Suggest Sub-Block
```json
POST /api/blocks/suggest
{
  "parentBlockId": "mainBlockId",
  "destination": "Local Cafe",
  "radius": 2.5
}
```

### 4. Approve Sub-Block
```json
PATCH /api/blocks/approve/subBlockId
{
  "approved": true
}
```

## Postman Collection

The Postman collection has been updated with a new "Family & Travel Type" folder containing:

1. **Family Signup** - Register a family user
2. **Couple Signup** - Register a couple user
3. **Create Main Block** - Create a main travel block
4. **Suggest Sub-Block** - Family member suggests destination
5. **Approve Sub-Block** - Head of family approves suggestion
6. **Reject Sub-Block** - Head of family rejects suggestion
7. **Get My Blocks** - Retrieve user's blocks
8. **Get Sub-Blocks** - Get sub-blocks for a main block

## Testing

Run the test script to verify functionality:

```bash
cd backend
node test-family-travel.js
```

This will:
- Create test users of all travel types
- Create main blocks and sub-blocks
- Test approval workflows
- Verify data relationships

## Workflow Examples

### Solo Traveler
1. User signs up as `solo_traveler`
2. Creates blocks normally
3. No approval workflow needed

### Family Travel
1. Head of family signs up as `family` with family members
2. Head creates main block for destination
3. Family members suggest sub-destinations within radius
4. Head approves/rejects suggestions
5. Approved sub-blocks become part of the trip

### Couple Travel
1. One partner signs up as `couple` with partner info
2. Creates main block for destination
3. Partner can suggest sub-destinations
4. Original partner approves/rejects suggestions

## Security & Validation

- Only family/couple members can suggest sub-blocks
- Only head of family can approve/reject suggestions
- All endpoints require authentication
- Input validation on all new fields
- Proper error handling and responses

## Future Enhancements

- Email notifications for sub-block suggestions
- Role-based permissions within families
- Group chat for family trip planning
- Budget tracking per family member
- Location-based suggestions within radius
