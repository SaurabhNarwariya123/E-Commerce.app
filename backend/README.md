# AI Chatbot Backend Setup

## Overview
Production-ready AI chatbot integration using Google Gemini API, MongoDB, and Express.js

## Quick Setup (5 Minutes)

### 1. Get Google Gemini API Key
- Visit: https://aistudio.google.com/app/apikeys
- Create a new API key
- Copy it

### 2. Configure Environment
Create `backend/.env`:
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
AI_MODEL=gemini-1.5-flash
AI_SERVICE_ENABLED=true
```

### 3. Install & Run
```bash
cd backend
npm install
npm run server
```

Expected output:
```
AI Chatbot configured successfully
server started on PORT : 4000
```

## Project Structure

```
backend/
├── config/
│   └── ai.js                 # Centralized AI configuration
├── ai/
│   ├── intentDetection.service.js   # Intent analysis
│   ├── mongoQuery.service.js         # MongoDB queries
│   ├── prompt.service.js             # Prompt building
│   ├── gemini.service.js             # Gemini API integration
│   ├── responseFormatter.service.js  # Response formatting
│   ├── aiRouter.service.js           # Service orchestration
│   ├── SETUP.md                      # Detailed setup guide
│   └── README.md                     # Services documentation
├── controllers/
│   └── aiChat.controller.js  # HTTP request handlers
├── routes/
│   └── aiChat.routes.js      # API route definitions
├── .env.example              # Environment template
└── .gitignore               # Git ignore rules
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_GEMINI_API_KEY` | ✅ | - | Gemini API key from Google |
| `AI_MODEL` | ❌ | gemini-1.5-flash | Model to use |
| `AI_SERVICE_ENABLED` | ❌ | true | Enable/disable service |
| `AI_RESPONSE_TIMEOUT` | ❌ | 30000 | Timeout in milliseconds |
| `AI_MAX_TOKENS` | ❌ | 2048 | Max response tokens |

### Configuration File
Edit `backend/config/ai.js` to customize default values.

## API Endpoints

### 1. Chat Endpoint
```bash
POST /api/ai/chat
```
**Body:**
```json
{
  "message": "Show my orders today",
  "userId": "user_id"
}
```
**Response:**
```json
{
  "success": true,
  "response": "You have 5 orders today totaling $250.50...",
  "type": "ORDERS",
  "confidence": 95,
  "processingTime": 1234,
  "metadata": {...}
}
```

### 2. Stream Endpoint
```bash
POST /api/ai/chat/stream
```
Real-time streaming response using Server-Sent Events.

### 3. Get Intents
```bash
GET /api/ai/intents
```
Get available intent categories and keywords.

### 4. Get Examples
```bash
GET /api/ai/examples
```
Get example queries for each category.

### 5. Health Check
```bash
GET /api/ai/health
```
Verify Gemini API is configured and working.

## Authentication
All chat endpoints require JWT authentication:
```bash
Authorization: Bearer {token}
```

## Usage Examples

### Frontend Integration
```jsx
import AIChat from './components/AIChat';

export default function ChatPage() {
  return (
    <AIChat 
      userId={userId}
      backendUrl="http://localhost:4000"
    />
  );
}
```

### Testing with curl
```bash
# Health check
curl http://localhost:4000/api/ai/health

# Chat (with token)
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show my orders", "userId": "user_id"}'
```

## Supported Query Types

| Type | Example | Intent |
|------|---------|--------|
| Orders | "Show my orders today" | ORDERS |
| Sales | "What are my total sales?" | SALES |
| Products | "Best selling products" | PRODUCTS |
| Customers | "New customers this week" | CUSTOMERS |
| Analytics | "Business summary" | ANALYTICS |

## Troubleshooting

### Error: GOOGLE_GEMINI_API_KEY is not configured
**Solution**: Ensure API key is added to `.env`

### Error: AI Chatbot not configured
**Solution**: Check if `GOOGLE_GEMINI_API_KEY` is valid

### Timeout errors
**Solution**: Increase `AI_RESPONSE_TIMEOUT` in `.env`

### Connection errors
**Solution**: 
- Check MongoDB connection
- Verify Gemini API key is valid
- Check network connectivity

## Development

### Running in Development
```bash
npm run server
# Uses nodemon for auto-reload
```

### Running in Production
```bash
NODE_ENV=production npm start
```

## Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] `.env` file NOT committed to git
- [ ] Gemini API key verified
- [ ] MongoDB connection working
- [ ] All endpoints tested
- [ ] CORS origins configured

### Deploy to Production
1. Set environment variables on hosting platform
2. Ensure `.env` is in `.gitignore`
3. Run `npm install`
4. Start server with `npm start`

## Performance Optimization

- **Caching**: Implement Redis for query results
- **Database**: Use MongoDB indexes on `userId`, `date`, `status`
- **API**: Use Gemini Flash model for speed
- **Timeout**: Adjust `AI_RESPONSE_TIMEOUT` based on needs

## Security

- **Authentication**: JWT token required for chat endpoints
- **User Isolation**: Queries filtered by `userId`
- **Input Validation**: 3-500 character limit
- **API Key**: Stored in environment variables only
- **CORS**: Configured for allowed origins

## Documentation

- `backend/ai/SETUP.md` - Detailed setup instructions
- `backend/ai/README.md` - Service documentation
- `/QUICK_START.md` - 5-minute guide
- `/AI_CHATBOT_GUIDE.md` - Complete reference
- `/ARCHITECTURE_DIAGRAMS.md` - System architecture

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the documentation files
3. Check the service logs
4. Verify environment configuration

## Version Info
- Node.js: 14+
- Express: 5.1.0
- Mongoose: 8.14.2
- Google Generative AI: 0.13.0
- LangChain: 0.5.0

---

**Ready to use!** Start the server and integrate the AI chat component into your app.
