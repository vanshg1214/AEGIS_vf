import React, { useState, useRef, useEffect } from 'react';
import { Truck, CheckCircle2, ChevronRight, MapPin, Calendar, Phone, User, Video } from 'lucide-react';
import './App.css';

// States for our multi-step experience
const STATES = {
  VIDEO: 'VIDEO',
  FORM: 'FORM',
  SUCCESS: 'SUCCESS'
};

function App() {
  const [currentState, setCurrentState] = useState(() => {
    return window.location.pathname === '/form' ? STATES.FORM : STATES.VIDEO;
  });
  const [formData, setFormData] = useState({ name: '', address: '', whatsapp: '', dob: '1963-05-04' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);

  // Using the freshly enhanced local video file
  const videoSrc = "/Diego(1).mp4";

  const handleGlobalClick = () => {
    // If we're in the video state and it's paused, any click anywhere forces it to play.
    if (currentState === STATES.VIDEO && videoRef.current && videoRef.current.paused) {
      videoRef.current.volume = 1.0;
      videoRef.current.play().catch(e => console.error("Play failed", e));
    }
  };

  const handleVideoEnded = () => {
    setCurrentState(STATES.FORM);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/Verdecasabrands2@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "Nombre completo": formData.name,
            "Número de WhatsApp": formData.whatsapp,
            "Fecha de nacimiento": formData.dob,
            "Dirección completa": formData.address,
            _subject: `Nueva Solicitud de Registro - AEGIS: ${formData.name}`,
            _template: "table", // Formats the email into a beautiful clean table
            _captcha: "false" // Ensures seamless AJAX submission without redirects/captchas
        })
      });

      if (response.ok) {
        setIsSubmitting(false);
        setCurrentState(STATES.SUCCESS);
      } else {
        console.error("Transmission Failed", response);
        setIsSubmitting(false);
        alert("Something went wrong reaching the server. Please check your connection and try again.");
      }
    } catch (error) {
      console.error("Network Error", error);
      setIsSubmitting(false);
      alert("A network error occurred. Please try again.");
    }
  };

  // Programmatically attempt autoplay. If it fails, the global click catches them.
  useEffect(() => {
    if (currentState === STATES.VIDEO && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.volume = 1.0;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay blocked. Awaiting user click.", error);
        });
      }
    }
  }, [currentState]);

  return (
    <div className="app-container" onClick={handleGlobalClick}>
      
      {currentState === STATES.VIDEO && (
        <div className="video-container">
          <video 
            ref={videoRef}
            src={videoSrc}
            onEnded={handleVideoEnded}
            autoPlay
            playsInline
            controls={false}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}

      {currentState === STATES.FORM && (
        <div className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="form-icon-header">
              <img src="/AEGIS-REVISION-1-photoaidcom-cropped.jpg" alt="AEGIS Logo" style={{ height: '64px', width: 'auto', borderRadius: '12px' }} />
            </div>
            <h1 className="brand-heading">AEGIS</h1>
            <h2 className="form-subtitle">Únete a nuestro equipo de entregas</h2>
            <p className="subtitle">
              ¿Listo para salir a la carretera? Proporciona tus datos a continuación para comenzar tu viaje con nosotros.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="delivery-form">
            <div className="form-group grid-full">
              <label htmlFor="name"><User size={16} /> Nombre completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="form-control" 
                placeholder="ej. Juan Pérez"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group grid-full">
              <label htmlFor="address"><MapPin size={16} /> Dirección completa</label>
              <textarea 
                id="address" 
                name="address" 
                className="form-control" 
                placeholder="Ingresa tu dirección residencial completa"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                required
              ></textarea>
            </div>

            <div className="form-group grid-half">
              <label htmlFor="whatsapp"><Phone size={16} /> Número de WhatsApp</label>
              <input 
                type="tel" 
                id="whatsapp" 
                name="whatsapp" 
                className="form-control" 
                placeholder="+1 (555) 000-0000"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group grid-half">
              <label htmlFor="dob"><Calendar size={16} /> Fecha de nacimiento</label>
              <input 
                type="date" 
                id="dob" 
                name="dob" 
                className="form-control" 
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary form-submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="loader"></div>
              ) : (
                <>
                  Enviar solicitud
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {currentState === STATES.SUCCESS && (
        <div className="glass-card success-screen">
          <CheckCircle2 size={80} className="success-icon" />
          <div>
            <h1 className="brand-heading">AEGIS</h1>
            <h1>¡Solicitud enviada!</h1>
            <p className="subtitle">
              Hemos recibido tus datos. Nuestro equipo se pondrá en contacto contigo por WhatsApp en breve. ¡Bienvenido al equipo!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
