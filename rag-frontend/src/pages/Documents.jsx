import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  Search,
  FileText,
  Trash2,
  Edit2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { DocumentUploadModal } from "../components/document/DocumentUploadModal";
import { PDFViewerModal } from "../components/document/PDFViewerModal";
import API from "../api/axios";
import toast from "react-hot-toast";
import { SummaryModal } from "../components/document/SummaryModal";

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // PDF Viewer State
  const [viewerDoc, setViewerDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/documents/");
      setDocuments(res.data);
    } catch (error) {
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await API.delete(`/documents/${id}`);
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  // Add state in Documents.jsx
  const [summaryDoc, setSummaryDoc] = useState(null);

  const filteredDocs = documents.filter((doc) =>
    doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Documents Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and view your uploaded PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-xl text-sm focus:border-brand-500 outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-md transition whitespace-nowrap flex items-center gap-2"
          >
            <UploadCloud size={16} /> Upload
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-slate-500">Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-darkCard border-2 border-dashed border-slate-200 dark:border-darkBorder rounded-2xl p-12 text-center flex flex-col items-center">
          <FileText
            size={48}
            className="text-slate-300 dark:text-slate-600 mb-4"
          />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No documents found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Upload your first PDF document to start analyzing, searching, and
            chatting with its contents.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-6 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl shadow-md hover:scale-105 transition"
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder p-4 shadow-sm hover:shadow-md transition group flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                  <FileText size={24} />
                </div>
                <div className="flex gap-1 group-hover:opacity-100 transition">
                  <button
                    onClick={() => setViewerDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3
                className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1"
                title={doc.original_name}
              >
                {doc.original_name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 mt-auto pt-2">
                <span>
                  {(doc.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>{doc.number_of_pages} Pages</span>
              </div>

              <div
                onClick={() => setSummaryDoc(doc)}
                className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition"
              >
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    View Full Summary:
                  </span>{" "}
                  {doc.summary || "Click to view summary."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={fetchDocuments}
      />
      {viewerDoc && (
        <PDFViewerModal doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      )}
      
      {summaryDoc && (
        <SummaryModal doc={summaryDoc} onClose={() => setSummaryDoc(null)} />
      )}
    </div>
  );
};
