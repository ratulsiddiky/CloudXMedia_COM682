# CloudXMedia (COM682 CW2) — Cloud Media Dashboard

CloudXMedia is a cloud-native multimedia sharing web application developed for **COM682 Cloud Native Development Coursework 2**.

The application allows users to upload image files, view them in a gallery, update image titles, and delete media items. Image files are stored in **Azure Blob Storage**, while media metadata is stored in **Azure Cosmos DB**. The application is hosted on **Azure App Service** and deployed using **GitHub Actions CI/CD**.

---

## Live Demo

- App: `https://cloudxmedia-gallery-ratul.azurewebsites.net`
- Health check: `https://cloudxmedia-gallery-ratul.azurewebsites.net/health`

---

## Main Features

- Upload image files to Azure Blob Storage
- Store media metadata in Azure Cosmos DB
- View uploaded images in a responsive gallery
- Update image titles through the web interface
- Delete media items from the gallery
- REST API for create, read, update, and delete operations
- Polished responsive frontend design
- GitHub Actions deployment to Azure App Service

---

## Cloud-Native Features

- **Azure App Service** for hosting the Node.js web application
- **Azure Blob Storage** for scalable binary image storage
- **Azure Cosmos DB** for NoSQL metadata storage
- **GitHub Actions** for CI/CD deployment
- **REST API** for frontend/backend communication
- **Environment variables** for secure configuration
- **Rate limiting** to protect API routes
- **Compression** to improve response performance
- **Helmet security headers** with CSP configuration
- **CORS support**
- **Static asset caching**
- **Image upload size limit**
- **Image MIME-type validation**
- **Lazy-loaded gallery images**
- **Safer error responses** without exposing internal server details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Media Storage | Azure Blob Storage |
| Metadata Database | Azure Cosmos DB for NoSQL |
| Hosting | Azure App Service on Linux |
| CI/CD | GitHub Actions |
| Security / Performance | Helmet, CORS, Compression, Express Rate Limit |

---

## Repository Structure

```text
CloudXMedia_COM682/
├── .github/workflows/
│   └── deploy-appservice.yml
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── azure/
│   │   ├── blob.js
│   │   └── cosmos.js
│   └── routes/
│       └── media.routes.js
├── server.js
├── package.json
├── .env.example
└── README.md

Environment Variables

Create a local .env file using .env.example as a template.

Do not commit the real .env file.

# Server
PORT=3000

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=YOUR_CONNECTION_STRING
AZURE_STORAGE_CONTAINER_NAME=media

# Azure Cosmos DB
COSMOS_ENDPOINT=https://YOUR-ACCOUNT.documents.azure.com:443/
COSMOS_KEY=YOUR_KEY
COSMOS_DATABASE_ID=MediaMetadata
COSMOS_CONTAINER_ID=Items

# Demo User
DEFAULT_USER_ID=student-123

In Azure, these values should be configured in:

Azure Portal → App Service → Configuration → Application settings
Running Locally
1. Install dependencies
npm install
2. Configure environment variables

Create a .env file in the project root and add the required Azure configuration values.

3. Start the application
npm start

Open:

http://localhost:3000

Health check:

http://localhost:3000/health
REST API Endpoints

Base path:

/api/media
Create / Upload Image
POST /api/media/upload

Form-data fields:

Field	Type	Required	Description
title	string	Yes	Image title
userId	string	No	Demo user ID
file	image file	Yes	Image file, max 10MB

Example response:

{
  "ok": true,
  "item": {
    "id": "example-id",
    "userId": "student-123",
    "title": "Example image",
    "blobUrl": "https://example.blob.core.windows.net/media/example.jpg",
    "blobName": "student-123/example.jpg",
    "fileName": "example.jpg",
    "contentType": "image/jpeg",
    "size": 12345,
    "createdAt": "2026-05-07T00:00:00.000Z"
  }
}
Read Gallery
GET /api/media?userId=student-123&limit=20

The gallery returns non-deleted media items for the demo user.

Example response:

{
  "ok": true,
  "items": [],
  "limit": 20
}
Read One Media Item
GET /api/media/:id?userId=student-123
Update Media Title
PUT /api/media/:id

JSON body:

{
  "title": "Updated title"
}

Example response:

{
  "ok": true,
  "item": {
    "id": "example-id",
    "title": "Updated title"
  }
}
Delete Media Item
DELETE /api/media/:id

The delete operation marks the metadata document as deleted and attempts to remove the associated blob file from Azure Blob Storage.

Example response:

{
  "ok": true
}
Deployment

The application is deployed to Azure App Service using GitHub Actions.

Typical deployment flow:

GitHub push → GitHub Actions workflow → Azure App Service deployment

The Azure App Service runs the application using:

npm start
Azure Resources Used
Azure Resource	Purpose
Azure App Service	Hosts the Node.js Express application
Azure Blob Storage	Stores uploaded image files
Azure Cosmos DB	Stores media metadata
Azure App Service Configuration	Stores environment variables securely
Azure Log Stream	Used for runtime monitoring and debugging


Security and Reliability

The application includes several security and reliability improvements:

Environment variables keep secrets outside source code
Helmet adds HTTP security headers
CSP allows image loading from Azure Blob Storage
CORS is enabled
API rate limiting is applied to /api/media
File upload size is limited to 10MB
Only image MIME types are accepted
Internal server details are not exposed in API error responses
Static files are cached for better performance
Azure proxy trust is configured for App Service deployment


Scalability

CloudXMedia uses cloud-native services to support scalable operation:

Azure Blob Storage separates large media files from application compute
Cosmos DB stores flexible NoSQL metadata documents
App Service hosts the backend separately from storage and database layers
GitHub Actions makes deployment repeatable and automated
Rate limiting and compression help improve reliability and performance


Limitations
The current version uses a fixed demo user ID.
Authentication and role-based access control are not implemented.
The current version focuses on image uploads only.
Delete uses a coursework-safe soft-delete metadata approach.
Advanced monitoring through full Application Insights integration is a future improvement.


Future Improvements
Add user registration and login
Add admin/user roles
Add Azure Application Insights for deeper monitoring
Add Azure CDN for global image delivery
Add support for video and audio files
Add automated tests
Add user-specific galleries
Add search and filtering by title
Add image moderation or virus scanning


Academic Integrity and AI Acknowledgement

This project was developed as individual coursework for COM682 Cloud Native Development. Any external resources, documentation, or AI-assisted guidance used during development should be acknowledged according to the university’s academic integrity requirements.

License

This project is for academic coursework use.