# CargoLink

A logistics platform connecting businesses with transport solutions.

## Features

- Customer and Transporter portals
- Order management
- Real-time tracking
- Secure authentication
- Profile management

## Prerequisites

- Node.js >= 14.0.0
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CargoLink
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Deploying to Render

1. Create a Render account at https://render.com

2. Create a new Web Service

3. Connect your GitHub repository

4. Configure the service:
   - Name: cargolink
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `SESSION_SECRET`: A secure random string
   - `NODE_ENV`: production

6. Deploy!

## License

ISC
