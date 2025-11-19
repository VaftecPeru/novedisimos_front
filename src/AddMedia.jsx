import React, { useState, useEffect, useRef } from "react";

const MediaManager = () => {
  const [productId, setProductId] = useState("8523942494296");
  const [productGid, setProductGid] = useState(
    "gid://shopify/Product/8523942494296"
  );
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState("video");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleIdChange = (e) => {
    const newId = e.target.value.trim();
    setProductId(newId);
    setProductGid(newId ? `gid://shopify/Product/${newId}` : "");
  };

  const fetchMedia = async () => {
    if (!productId || isNaN(productId)) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/shopify/product/${productId}/media`
      );
      const data = await res.json();
      if (data.success && data.count > 0) {
        setMedia(data.media);
      } else {
        setMedia([]);
      }
    } catch (err) {
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setMediaType("video");
    setModalMessage("");
    setModalLoading(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleUpload = async (type) => {
    if (!productId || isNaN(productId)) {
      setModalMessage("ID no válido");
      return;
    }
    setModalLoading(true);
    setModalMessage("");
    const fileInput =
      type === "video" ? videoInputRef.current : imageInputRef.current;
    if (!fileInput.files[0]) {
      setModalLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append(type, fileInput.files[0]);
    try {
      const uploadUrl =
        type === "video" ? "/api/upload-video-only" : "/api/upload-image-only";
      const uploadRes = await fetch(`http://127.0.0.1:8000${uploadUrl}`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error("Error al subir");
      const resourceUrl = uploadData.resource_url;
      const attachUrl =
        type === "video"
          ? "/api/attach-video-to-product"
          : "/api/attach-image-to-product";
      const attachRes = await fetch(`http://127.0.0.1:8000${attachUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productGid,
          [type === "video" ? "video_resource_url" : "image_resource_url"]:
            resourceUrl,
        }),
      });
      const attachData = await attachRes.json();
      if (!attachData.success) throw new Error("Error al asociar");
      setModalMessage("Subido");
      closeModal();
      fetchMedia();
    } catch (err) {
      setModalMessage("Error");
    } finally {
      setModalLoading(false);
    }
  };

  const deleteMediaItem = async (id) => {
    setModalLoading(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/delete-product-media",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productGid, media_id: id }),
        }
      );
      const data = await res.json();
      if (data.success) fetchMedia();
    } catch (err) {}
    setModalLoading(false);
  };

  const setAsFirstItem = async (id) => {
    setModalLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/set-media-as-first", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productGid, media_id: id }),
      });
      const data = await res.json();
      if (data.success) fetchMedia();
    } catch (err) {}
    setModalLoading(false);
  };

  return (
    <>
      <style>{`
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 5px;
          margin-bottom: 20px;
          padding: 20px 0;
          grid-auto-rows: 100px; 
        }
        .media-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #000;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden; 
          position: relative; 
          height: auto;
          padding-bottom: 0; 
        }
        .media-item img,
        .media-item video,
        .media-item iframe,
        .media-item .video-processing-status {
          width: 100%;
          height: 100px; 
          object-fit: cover;
          display: block;
        }
        .media-item video {
          object-fit: contain; 
          background: #000;
        }
        .video-processing-status {
          background-color: #FFFACD !important;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        .media-actions {
          position: absolute; 
          top: 5px;
          right: 5px;
          z-index: 10; 
          display: flex;
          gap: 4px;
          background-color: rgba(0, 0, 0, 0.4); 
          padding: 3px;
          border-radius: 4px;
          border-top: none; 
        }
        .media-actions button {
          font-size: 0.7em; 
          padding: 2px; 
          line-height: 1;
          background-color: #1976d2; 
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .media-actions button:hover {
          background: #1565c0;
        }
        .media-actions button:first-child { 
          background-color: #dc3545;
        }
        .media-actions button:first-child:hover {
          background-color: #c82333; 
        }
        .media-type {
          position: absolute;
          bottom: 0; 
          left: 0;
          padding: 5px 10px;
          background-color: rgba(0, 0, 0, 0.7); 
          color: white;
          font-size: 0.8em;
          font-weight: bold;
          border-top-right-radius: 4px;
          z-index: 10;
        }
        .add-button {
          position: absolute;
          bottom: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
          transition: all 0.2s;
        }
        .add-button:hover {
          background: #1565c0;
          transform: translateY(-2px);
        }
        .modal {
          display: ${modalOpen ? "flex" : "none"};
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .close {
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          color: #aaa;
        }
        .close:hover {
          color: #000;
        }
        .form-container form { 
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .form-container button {
          padding: 12px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1em;
        }
        .modal-loading {
          text-align: center;
          color: #1976d2;
          font-weight: bold;
        }
        .no-media {
          grid-column: 1 / -1;
          text-align: center;
          color: #888;
          font-size: 1.2em;
          padding: 40px;
        }
        .media-item:first-child {
          grid-column: span 2;
          grid-row: span 2;
          width: 100%;
        }
        .media-item:first-child img,
        .media-item:first-child video,
        .media-item:first-child iframe,
        .media-item:first-child .video-processing-status {
          height: 100%;
          object-fit: cover;
        }
        .first-media .media-actions button:last-child {
          opacity: 1 !important;
          filter: none !important;
          border-color: gold;
          background: gold;
          color: black;
          font-weight: bold;
        }
        .media-actions button:last-child {
          opacity: 0.3;
          filter: grayscale(100%);
          transition: 0.2s;
        }
        .media-actions button:last-child:hover {
          opacity: 0.7;
          filter: grayscale(0%);
        }
      `}</style>
      <label>ID:</label>
      <input type="text" value={productId} onChange={handleIdChange} />
      <button onClick={fetchMedia}>Cargar</button>
      <div>ID: {productId}</div>
      {loading && <div>Cargando...</div>}
      <div className="media-grid">
        {media.length === 0 && !loading && (
          <div className="no-media">No medios</div>
        )}
        {media.map((item, index) => (
          <div
            key={item.id}
            className={`media-item ${index === 0 ? "first-media" : ""}`}
          >
            {item.__typename === "MediaImage" && (
              <img src={item.image.url} alt="Imagen" />
            )}
            {item.__typename === "Video" &&
              (item.sources?.length > 0 ? (
                <video src={item.sources[0].url} controls muted playsInline />
              ) : (
                <div className="video-processing-status">Video subiendo...</div>
              ))}
            {item.__typename === "ExternalVideo" && (
              <iframe src={item.embedUrl} allowFullScreen frameBorder="0" />
            )}
            {item.__typename === "Model3d" && <div>Modelo 3D</div>}
            <div className="media-type">
              {item.mediaContentType || item.__typename}
            </div>
            <div className="media-actions">
              <button onClick={() => deleteMediaItem(item.id)}>Borrar</button>
              <button onClick={() => setAsFirstItem(item.id)}>⭐</button>
            </div>
          </div>
        ))}
      </div>
      <button className="add-button" onClick={openModal}>
        +
      </button>
      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              ×
            </span>
            <button onClick={() => setMediaType("video")}>Video</button>
            <button onClick={() => setMediaType("image")}>Imagen</button>
            {mediaType === "video" && (
              <div className="form-container">
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/mp4,video/quicktime"
                />
                <button onClick={() => handleUpload("video")}>Subir</button>
              </div>
            )}
            {mediaType === "image" && (
              <div className="form-container">
                <input type="file" ref={imageInputRef} accept="image/*" />
                <button onClick={() => handleUpload("image")}>Subir</button>
              </div>
            )}
            {modalLoading && <div className="modal-loading">Subiendo...</div>}
            {modalMessage && <div>{modalMessage}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaManager;
