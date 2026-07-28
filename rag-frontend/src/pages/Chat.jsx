import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "../components/chat/ChatMessage";
import { ChatInput } from "../components/chat/ChatInput";
import { MultiDocSelector } from "../components/chat/MultiDocSelector";
import { PDFViewerModal } from "../components/document/PDFViewerModal";
import API from "../api/axios";
import toast from "react-hot-toast";
import { addNotification } from "../utils/notifications";

export const Chat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Document Selection State
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);

  // PDF Preview State for Citations
  const [activeCitation, setActiveCitation] = useState(null);

  // UI State
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    try {
      const res = await API.get("/chat/sessions");
      setSessions(res.data);
    } catch (error) {
      toast.error("Failed to load chat history.");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await API.get(`/chat/sessions/${chatId}/messages`);
      const formattedMessages = res.data.flatMap((msg) => [
        { role: "user", content: msg.question, id: `u_${msg._id}` },
        {
          role: "ai",
          content: msg.answer,
          citations: msg.citations,
          followUps: msg.suggested_followups,
          id: `a_${msg._id}`,
        },
      ]);
      setMessages(formattedMessages);
    } catch (error) {
      toast.error("Failed to load messages.");
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents/");
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents");
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);

    addNotification("New Chat", "Started a new RAG session.");
    if (window.innerWidth < 768) setIsHistoryOpen(false);
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    try {
      await API.delete(`/chat/sessions/${id}`);
      setSessions(sessions.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const handleCitationClick = (citation) => {
    const matchedDoc = documents.find(
      (d) =>
        d.id === citation.document_id ||
        d.original_name === citation.document_name,
    );
    if (matchedDoc) {
      setActiveCitation({
        doc: matchedDoc,
        page: citation.page_number,
      });
    } else {
      toast.error("Original PDF file is not available in library.");
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, id: userMsgId },
    ]);
    setIsGenerating(true);

    try {
      const payload = {
        chat_id: currentSessionId,
        question: text,
        document_ids: selectedDocIds.length > 0 ? selectedDocIds : null,
      };

      const res = await API.post("/chat/ask", payload);

      if (!currentSessionId) {
        setCurrentSessionId(res.data.chat_id);
        fetchSessions();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: res.data.answer,
          citations: res.data.citations,
          followUps: res.data.suggested_followups,
          id: `a_${Date.now()}`,
        },
      ]);
    } catch (error) {
      toast.error("Failed to get answer from AI.");
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "**Error:** Failed to generate response. Please try again.",
          isError: true,
          id: `err_${Date.now()}`,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex md:h-[calc(100vh-8rem)] h-[calc(100vh-7rem)] bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder overflow-hidden shadow-sm">
      {/* Sidebar: Chat History */}
      <AnimatePresence initial={false}>
        {isHistoryOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/50 z-20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="absolute md:relative z-30 md:h-full h-[84vh] border-r rounded-xl border-slate-200 dark:border-darkBorder bg-slate-100 dark:bg-slate-900 flex flex-col shrink-0 overflow-hidden shadow-xl md:shadow-none"
            >
              <div className="p-4 border-b border-slate-200 dark:border-darkBorder">
                <button
                  onClick={createNewChat}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-2">
                  Recent Chats
                </p>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      if (window.innerWidth < 768) setIsHistoryOpen(false);
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${currentSessionId === session.id ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700" : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent"}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare
                        size={16}
                        className={
                          currentSessionId === session.id
                            ? "text-brand-500"
                            : "text-slate-400"
                        }
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
                        {session.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 dark:border-darkBorder bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
            >
              {isHistoryOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {currentSessionId
                ? sessions.find((s) => s.id === currentSessionId)?.title ||
                  "Chat Session"
                : "New Chat Session"}
            </h2>
          </div>
          <button
            onClick={() => setIsDocSelectorOpen(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
          >
            {selectedDocIds.length === 0
              ? "Searching: All Documents"
              : `Searching: ${selectedDocIds.length} Document(s)`}
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 border border-brand-100 dark:border-brand-900/50 shadow-sm">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                How can I help you today?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">
                Ask a question and I'll search through your enterprise documents
                to find the exact answer, complete with page citations.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onFollowUpClick={handleSendMessage}
                onCitationClick={handleCitationClick}
              />
            ))
          )}

          {isGenerating && (
            <div className="flex gap-4 p-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                Searching documents and generating response...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-darkCard border-t border-slate-200 dark:border-darkBorder shrink-0">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isGenerating}
            onOpenDocSelector={() => setIsDocSelectorOpen(true)}
          />
        </div>
      </div>

      <MultiDocSelector
        isOpen={isDocSelectorOpen}
        onClose={() => setIsDocSelectorOpen(false)}
        documents={documents}
        selectedDocIds={selectedDocIds}
        onChange={setSelectedDocIds}
      />

      {activeCitation && (
        <PDFViewerModal
          doc={activeCitation.doc}
          initialPage={activeCitation.page}
          onClose={() => setActiveCitation(null)}
        />
      )}
    </div>
  );
};
