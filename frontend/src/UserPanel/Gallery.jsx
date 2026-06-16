import { useState, useEffect } from "react";
import { Images, Upload, Trash2, X, CalendarDays, ImagePlus } from "lucide-react";
import { API_BASE_URL as API } from "../config/api.js";

export default function Gallery() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [viewImage, setViewImage] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch registered events + my uploads on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, imgRes] = await Promise.all([
        fetch(`${API}/registrations`, { headers }),
        fetch(`${API}/images/my-uploads`, { headers }),
      ]);
      const regData = await regRes.json();
      const imgData = await imgRes.json();

      if (regData.success) {
        // Extract unique events from registrations
        const events = regData.registrations
          .filter((r) => r.event)
          .map((r) => r.event);
        // Deduplicate by _id
        const unique = [];
        const seen = new Set();
        for (const ev of events) {
          if (!seen.has(ev._id)) {
            seen.add(ev._id);
            unique.push(ev);
          }
        }
        setRegisteredEvents(unique);
      }
      if (imgData.success) setMyUploads(imgData.images);
    } catch (err) {
      console.error("Failed to load gallery data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setMessage({ text: "Only JPG, PNG, and WebP images are allowed.", type: "error" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: "Image must be under 2MB.", type: "error" });
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);
    setMessage({ text: "", type: "" });

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      setMessage({ text: "Please select an event.", type: "error" });
      return;
    }
    if (!fileData) {
      setMessage({ text: "Please select an image.", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`${API}/images/upload`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          imageData: fileData,
          fileName,
          mimeType,
          caption,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: "Image uploaded successfully!", type: "success" });
        setPreview(null);
        setFileData(null);
        setFileName("");
        setCaption("");
        setSelectedEventId("");
        fetchData();
      } else {
        setMessage({ text: data.message || "Upload failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Something went wrong. Try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      const res = await fetch(`${API}/images/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setMyUploads((prev) => prev.filter((img) => img._id !== id));
      } else {
        alert(data.message || "Failed to delete.");
      }
    } catch {
      alert("Failed to delete image.");
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileData(null);
    setFileName("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400 text-sm font-semibold">Loading gallery...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="m-0 mb-2 text-orange-500 text-xs font-black tracking-widest uppercase">
          Event Memories
        </p>
        <h2 className="m-0 text-stone-900 text-3xl font-black">My Gallery</h2>
        <p className="mt-2 text-stone-500 text-sm">
          Upload photos from events you've attended. They'll be shared with the event organizer.
        </p>
      </div>

      {/* ── Upload Section ── */}
      <div className="rounded-2xl border border-stone-200/60 bg-white/80 shadow-md p-6 mb-8">
        <h3 className="m-0 mb-5 text-stone-800 text-base font-black flex items-center gap-2">
          <Upload size={18} className="text-orange-500" />
          Upload Photo
        </h3>

        {registeredEvents.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <Images size={36} className="mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-semibold m-0">No registered events found</p>
            <p className="text-xs m-0 mt-1">
              Register for events first to upload photos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            {/* Event selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-white outline-none focus:border-orange-400 transition-colors cursor-pointer"
              >
                <option value="">— Choose a registered event —</option>
                {registeredEvents.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                    {ev.date
                      ? ` — ${new Date(ev.date).toLocaleDateString()}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* File input + preview */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                Image (JPG, PNG, WebP — max 2MB)
              </label>

              {preview ? (
                <div className="relative w-fit">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-xl border border-stone-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPreview}
                    className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white border-0 cursor-pointer shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <p className="mt-1 text-xs text-stone-400 m-0">{fileName}</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all">
                  <ImagePlus size={32} className="text-stone-300 mb-2" />
                  <span className="text-sm font-semibold text-stone-500">
                    Click to select an image
                  </span>
                  <span className="text-xs text-stone-400 mt-1">
                    or drag and drop
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
                placeholder="e.g. Amazing keynote session!"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 bg-white outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            {/* Message */}
            {message.text && (
              <div
                className={`text-sm font-semibold px-4 py-3 rounded-xl ${
                  message.type === "error"
                    ? "bg-red-50 text-red-500 border border-red-200"
                    : "bg-green-50 text-green-600 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto self-start px-6 h-10 rounded-xl text-sm font-bold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
              }}
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </form>
        )}
      </div>

      {/* ── My Uploads Grid ── */}
      <div className="mb-4">
        <h3 className="m-0 mb-5 text-stone-800 text-base font-black flex items-center gap-2">
          <Images size={18} className="text-orange-500" />
          My Uploads
          <span className="text-xs font-bold text-stone-400 ml-1">
            ({myUploads.length})
          </span>
        </h3>

        {myUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-stone-400 rounded-2xl border border-stone-200/60 bg-white/80">
            <Images size={40} className="text-stone-300" />
            <p className="m-0 text-sm font-bold text-stone-500">
              No photos uploaded yet
            </p>
            <p className="m-0 text-xs">
              Upload your first event photo above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {myUploads.map((img) => (
              <div
                key={img._id}
                className="group relative rounded-xl border border-stone-200/60 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {/* Image */}
                <div
                  className="aspect-square cursor-pointer overflow-hidden"
                  onClick={() => setViewImage(img)}
                >
                  <img
                    src={img.imageData}
                    alt={img.caption || img.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="m-0 text-xs font-bold text-stone-700 truncate">
                    {img.eventId?.title || "Event"}
                  </p>
                  {img.caption && (
                    <p className="m-0 mt-1 text-xs text-stone-400 truncate">
                      {img.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(img._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 border-0 cursor-pointer hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-6 bg-stone-900/60 backdrop-blur-sm"
          onClick={() => setViewImage(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setViewImage(null)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border-0 cursor-pointer hover:bg-white transition-colors"
            >
              <X size={16} className="text-stone-700" />
            </button>
            <img
              src={viewImage.imageData}
              alt={viewImage.caption || viewImage.fileName}
              className="w-full max-h-[70vh] object-contain bg-stone-100"
            />
            <div className="p-5">
              <p className="m-0 text-sm font-bold text-stone-800">
                {viewImage.eventId?.title || "Event Photo"}
              </p>
              {viewImage.caption && (
                <p className="m-0 mt-1 text-sm text-stone-500">
                  {viewImage.caption}
                </p>
              )}
              <p className="m-0 mt-2 text-xs text-stone-400">
                Uploaded {new Date(viewImage.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
