import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

const NumberPlateRecognition = ({ addParkingLog }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEntry, setIsEntry] = useState(true); // State to track entry/exit

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setIsCameraActive(false);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    recognizePlate(imageData);
  };

  const recognizePlate = (image) => {
    setLoading(true);
    Tesseract.recognize(image, 'eng', {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      setRecognizedText(text.trim());
      stopCamera();
      setLoading(false);
      setShowConfirmation(true);
    }).catch((error) => {
      console.error('Error recognizing text:', error);
      setLoading(false);
    });
  };

  const handleConfirm = () => {
    addParkingLog(recognizedText, isEntry);
    setShowConfirmation(false);
    setRecognizedText('');
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setRecognizedText('');
  };

  return (
    <div className="npr-section mb-10 p-6 rounded-lg shadow-md" style={{ backgroundColor: '#FFDFB0' }}>
      <h3 className="text-3xl font-semibold mb-6" style={{ color: '#4A6D0A' }}>Number Plate Recognition</h3>

      {/* Video Feed */}
      <div className="video-container mb-6 rounded-lg overflow-hidden border-2 border-gray-300">
        <video ref={videoRef} className="w-full h-auto" style={{ borderRadius: '8px' }}></video>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>

      {!isCameraActive ? (
        <button
          className="py-3 px-6 rounded-lg bg-[#4A6D0A] hover:bg-[#5d80ff] transition text-white mb-4 shadow-lg"
          onClick={startCamera}
        >
          Start Camera
        </button>
      ) : (
        <button
          className="py-3 px-6 rounded-lg bg-[#4A6D0A] hover:bg-[#5d80ff] transition text-white mb-4 shadow-lg"
          onClick={captureImage}
        >
          Capture Image
        </button>
      )}

      {/* Entry/Exit Toggle */}
      <div className="flex items-center mt-4 mb-6 space-x-4">
        <label className="text-lg">
          <input 
            type="radio" 
            value="entry" 
            checked={isEntry} 
            onChange={() => setIsEntry(true)} 
            className="mr-2"
          />
          Entry
        </label>
        <label className="text-lg">
          <input 
            type="radio" 
            value="exit" 
            checked={!isEntry} 
            onChange={() => setIsEntry(false)} 
            className="mr-2"
          />
          Exit
        </label>
      </div>

      {/* Display Recognized Text */}
      {recognizedText && (
        <div className="recognized-text mt-6 p-4 rounded-lg bg-[#FFE8C1] text-[#4A6D0A] border-2 border-[#4A6D0A]">
          <h4 className="text-2xl font-semibold">Recognized Number Plate:</h4>
          <p className="text-xl">{recognizedText}</p>
        </div>
      )}

      {loading && <p className="text-lg mt-4 text-gray-700">Recognizing...</p>}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-dialog mt-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h4 className="text-xl font-semibold mb-4">Confirm {isEntry ? 'Entry' : 'Exit'} Log</h4>
          <p className="mb-4 text-gray-700">Do you want to log this number plate as an {isEntry ? 'entry' : 'exit'}?</p>
          <div className="flex space-x-4">
            <button onClick={handleConfirm} className="py-2 px-4 rounded bg-green-500 hover:bg-green-600 text-white shadow-md">
              Yes
            </button>
            <button onClick={handleCancel} className="py-2 px-4 rounded bg-red-500 hover:bg-red-600 text-white shadow-md">
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberPlateRecognition;
