# Project Payment Manager

A comprehensive web application for managing construction and renovation projects with integrated payment tracking, built with React, TypeScript, and Firebase.

## Features

### 📊 Dashboard
- Overview of all active projects with payment status
- Visual charts showing payment progress (Bar Chart & Pie Chart)
- Summary cards displaying total costs, paid amounts, and remaining balances
- Payment status table with progress indicators

### 📋 Project Management
- Create, edit, and delete projects
- Support for multiple project types:
  - Commercial
  - House Additions
  - Buildings
  - New Constructions
  - Attics Renovations
  - Basement Addition
- Track key dates:
  - Created Date
  - Started Date
  - Revision Date
  - Delivery Date
- Set project costs and active/inactive status

### 💳 Payment Tracking
- Record payments for each project with:
  - Amount
  - Date
  - Notes
  - Optional payment images (stored in Firebase)
- View payment history and progress
- Real-time balance calculations
- Payment progress visualization

### 📑 Project Views
- **Dashboard**: Overview of active projects
- **All Projects**: Complete list sorted by started date
- **Completed Projects**: Archive of inactive projects

### 📊 CSV Export
- Export payment details to CSV format
- Includes all payment information per project
- One-click download functionality

### 📱 Responsive Design
- Fully responsive layout using Tailwind CSS
- Mobile-friendly navigation and forms
- Optimized for desktop, tablet, and mobile devices

### 🔐 Firebase Integration
- Real-time database for projects and payments
- Firebase Cloud Storage for payment images
- Secure data persistence
- Scalable infrastructure

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Firebase (Firestore + Cloud Storage)
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

## Usage

### Creating a Project
1. Click the "New Project" button in the header
2. Fill in the project details (name, type, dates, cost, etc.)
3. Check "Active Project" to include it in the dashboard
4. Click "Save Project"

### Recording Payments
1. Navigate to "All Projects" or view from the Dashboard
2. Click the eye icon next to a project
3. Click "Add Payment"
4. Enter payment amount, date, and optional note
5. Optionally upload a payment receipt image
6. Click "Save Payment"

### Exporting Payment Data
1. Open a project's payment details
2. Click "Export CSV"
3. The CSV file will download with all payment records

### Managing Projects
- **Edit**: Click the edit icon in the project list
- **Delete**: Click the delete icon (with confirmation)
- **Archive**: Uncheck "Active Project" to move to Completed tab

## Project Structure

```
src/
├── components/
│   ├── ProjectForm.tsx      # Project creation/editing form
│   └── PaymentManagement.tsx # Payment tracking modal
├── pages/
│   ├── Dashboard.tsx         # Overview and analytics
│   ├── ProjectsList.tsx      # All projects sorted by date
│   └── InactiveProjects.tsx  # Completed projects
├── context/
│   └── FirebaseContext.tsx   # Firebase configuration and hooks
├── App.tsx                   # Main application component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Firebase Setup

### Firestore Collections

**projects**
```
{
  name: string
  description: string
  type: "commercial" | "house_additions" | "buildings" | "new_constructions" | "attics_renovations" | "basement_addition"
  createdDate: string (YYYY-MM-DD)
  startedDate: string (YYYY-MM-DD)
  revisionDate: string (YYYY-MM-DD)
  deliveryDate: string (YYYY-MM-DD)
  cost: number
  active: boolean
}
```

**payments**
```
{
  projectId: string (reference to project)
  amount: number
  note: string
  date: string (YYYY-MM-DD)
  imageUrl: string (optional, URL from Cloud Storage)
}
```

### Storage Structure

Payment images are stored in `payments/` folder with timestamp-based filenames.

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready for deployment.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features Roadmap

- [ ] User authentication
- [ ] Multi-user project sharing
- [ ] Email notifications for payment reminders
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Project templates
- [ ] Integration with accounting software

## License

MIT License

## Support

For issues or feature requests, please open an issue on the project repository.
