# Delegation Management System

A comprehensive system for managing military and civilian delegations for large events, built with Django REST Framework and React.

## 🚀 Features

- **Event Management**: Create and manage main events and sub-events
- **Delegation Management**: Register and manage delegations with member details
- **Real-time Updates**: WebSocket integration for live data updates
- **User Management**: Role-based access control (SUPER_ADMIN, ADMIN, USER)
- **Reporting**: PDF and Excel export functionality
- **Responsive Design**: Modern UI with Arabic RTL support

## 🛠️ Technology Stack

### Backend
- Django 5.2.7
- Django REST Framework
- Django Channels (WebSocket)
- PostgreSQL
- Python 3.8+

### Frontend
- React 19
- Redux Toolkit
- Vite 7
- Tailwind CSS 4
- Shadcn UI

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd Delegation-Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd Delegation-Front
npm install
npm run dev
```

## 🌐 WebSocket Configuration

The system includes real-time WebSocket updates. Configure the WebSocket URL in your environment:

```env
VITE_WS_URL=ws://localhost:8000/ws/updates/
```

## 📱 Usage

1. **Login** with your credentials
2. **Create Events** - Set up main events and sub-events
3. **Register Delegations** - Add delegations with member details
4. **Manage Members** - Add, edit, or remove delegation members
5. **Generate Reports** - Export data in PDF or Excel format

## 🔧 API Endpoints

- `/api/auth/` - Authentication
- `/api/main-events/` - Main events management
- `/api/sub-events/` - Sub events management
- `/api/delegations/` - Delegations management
- `/api/members/` - Members management
- `/api/check-outs/` - Departure sessions
- `/api/stats/` - System statistics

## 📄 License

This project is proprietary software.