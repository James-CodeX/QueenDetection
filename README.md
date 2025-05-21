# Buzz Detect 🐝

A sophisticated web application that uses machine learning to analyze bee hive audio recordings and detect the presence of queen bees. This tool helps beekeepers monitor their hives more effectively through audio analysis.

## Features

- 🎵 Audio file upload and analysis
- 📊 Real-time audio feature visualization
- 🧠 Machine learning-based queen bee detection
- 📈 Confidence scoring for detection results
- 🎨 Modern, responsive user interface
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications

### Backend
- Python FastAPI
- Machine Learning model for audio analysis
- Audio processing libraries

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git https://github.com/Harsh-1711/BuzzDetect.git
cd BuzzDetect
```

2. Set up the backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd client
npm install
# or
yarn install
```

## Running the Application

1. Start the backend server:
```bash
cd server
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

2. Start the frontend development server:
```bash
cd client
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Usage

1. Navigate to the home page
2. Upload an audio file of a bee hive recording
3. Wait for the analysis to complete
4. View the results, including:
   - Queen bee presence detection
   - Confidence score
   - Audio feature visualization

## Project Structure

```
buzz-detect/
├── client/                 # Frontend React application
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Python application
│   ├── api/              # API endpoints
│   ├── model/            # ML model files
│   ├── services/         # Business logic
│   └── requirements.txt  # Python dependencies
└── dataset/              # Training and test datasets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the beekeeping community for their valuable feedback 