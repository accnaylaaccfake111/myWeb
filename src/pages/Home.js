// frontend/src/pages/Home.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import imgBanner from "../assets/img/img_barner7.jpg";
import chatbotIcon from "../assets/img/chatbot.png";
import {
  Music,
  Smile,
  Sparkles,
  Mic,
  ArrowRight,
  X,
  Send,
  Trash2,
  MessageCircle,
  ArrowLeft,
  Square,
} from "lucide-react";
import { storage } from "../utils/storage";
import axios from "axios";

const Home = () => {
  const features = [
    {
      id: 1,
      icon: <Sparkles className="w-6 h-6 text-red-600" />,
      title: "Mô phỏng điệu múa",
      description: "Phân tích và tái tạo các động tác múa truyền thống qua AI",
      path: "/dancing",
      color: "bg-red-100",
      borderColor: "hover:border-red-300",
      textColor: "text-red-600",
    },
    {
      id: 2,
      icon: <Smile className="w-6 h-6 text-amber-600" />,
      title: "Ghép mặt vui nhộn",
      description: "Tạo những khoảnh khắc vui vẻ bằng công nghệ ghép mặt AI",
      path: "/face-swap",
      color: "bg-amber-100",
      borderColor: "hover:border-amber-300",
      textColor: "text-amber-600",
    },
    {
      id: 3,
      icon: <Music className="w-6 h-6 text-blue-600" />,
      title: "Sáng tác lời bài hát",
      description: "AI giúp bạn sáng tác lời bài hát theo chủ đề yêu thích",
      path: "/lyrics-composition",
      color: "bg-blue-100",
      borderColor: "hover:border-blue-300",
      textColor: "text-blue-600",
    },
    {
      id: 4,
      icon: <Mic className="w-6 h-6 text-green-600" />,
      title: "Karaoke và chấm điểm",
      description: "Hát karaoke và nhận đánh giá từ AI về giọng hát của bạn",
      path: "/karaoke",
      color: "bg-green-100",
      borderColor: "hover:border-green-300",
      textColor: "text-green-600",
    },
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counters, setCounters] = useState({
    users: 0,
    projects: 0,
    satisfaction: 0,
  });

  // State cho chatbot
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State cho voice chat realtime
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationState, setConversationState] = useState("IDLE"); // IDLE, LISTENING, ANALYZING, SPEAKING
  const [error, setError] = useState(null);

  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const recognitionRef = useRef(null);
  const femaleVoiceRef = useRef(null);

  // API endpoints
  const API_BASE_URL = process.env.REACT_APP_BE_API || "http://localhost:8080";
  const SEND_MESSAGE_API = `${API_BASE_URL}/api/chat/send`;
  const CHAT_HISTORY_API = `${API_BASE_URL}/api/chat/history`;

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "vi-VN";
      recognitionRef.current.interimResults = true;
    } else {
      setError("Speech recognition is not supported in this browser.");
    }
  }, []);
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      if (availableVoices.length === 0) {
        // Trình duyệt chưa tải xong, đợi event
        return;
      }

      // 1. Ưu tiên tìm giọng có chữ "Nữ" hoặc "Female"
      let bestVoice = availableVoices.find(
        (voice) =>
          voice.lang.startsWith("vi") && // Bất kỳ tiếng Việt nào
          (voice.name.includes("Nữ") ||
            voice.name.includes("Female") ||
            voice.name.includes("Google Tiếng Việt"))
      );

      // 2. Nếu không, lấy bất kỳ giọng vi-VN nào
      if (!bestVoice) {
        bestVoice = availableVoices.find((voice) =>
          voice.lang.startsWith("vi-VN")
        );
      }

      // 3. Lưu giọng tốt nhất tìm được vào ref
      if (bestVoice) {
        femaleVoiceRef.current = bestVoice;
        console.log("Đã chọn giọng đọc:", bestVoice.name); // Để debug
      } else {
        console.warn("Không tìm thấy giọng đọc tiếng Việt.");
      }

      // Đã tìm thấy, không cần lắng nghe sự kiện nữa
      window.speechSynthesis.onvoiceschanged = null;
    };

    // Tải danh sách giọng đọc
    loadVoices();

    // Một số trình duyệt (như Chrome) tải danh sách bất đồng bộ
    // Cần lắng nghe sự kiện onvoiceschanged
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []); // Chạy 1 lần duy nhất

  // Speech Recognition Event Handlers
  useEffect(() => {
    if (!recognitionRef.current) return;

    const analyzeAndSpeak = async (text) => {
      if (!text.trim()) {
        setConversationState("IDLE");
        setIsRecording(false);
        return;
      }

      setConversationState("ANALYZING");
      setIsRecording(false);

      try {
        const token = storage.getAccessToken();
        if (!token) {
          throw new Error("You must be logged in to analyze text.");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/chat/analyze-and-speak`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ text }),
          }
        );

        if (!response.ok)
          throw new Error(`Server error: ${response.statusText}`);

        const data = await response.json();
        const responseText = data.responseText;

        if (responseText) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          if (femaleVoiceRef.current) {
            utterance.voice = femaleVoiceRef.current;
            utterance.lang = femaleVoiceRef.current.lang; // Đảm bảo lang khớp với voice
          } else {
            // Nếu không tìm thấy, quay về cách cũ (trình duyệt tự chọn)
            utterance.lang = "vi-VN";
          }

          utterance.onstart = () => {
            setConversationState("SPEAKING");
          };
          utterance.onend = () => {
            // When bot finishes, listen again
            setConversationState("IDLE");
            startListening();
          };
          utterance.onerror = () => {
            setConversationState("IDLE");
            startListening();
          };

          window.speechSynthesis.speak(utterance);
        } else {
          setConversationState("IDLE");
          startListening();
        }
      } catch (err) {
        console.error("Error in analyzeAndSpeak:", err);
        setError(err.message);
        setConversationState("IDLE");
        setIsRecording(false);
      }
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = finalTranscript;
      setTranscript(interimTranscript || finalTranscript);
    };

    recognitionRef.current.onspeechstart = () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };

    recognitionRef.current.onend = () => {
      analyzeAndSpeak(finalTranscriptRef.current);
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setConversationState("IDLE");
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [API_BASE_URL]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available");
      return;
    }

    // Stop any speaking and start listening
    window.speechSynthesis.cancel();
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
    setConversationState("LISTENING");
    setIsRecording(true);
    setRecordingTime(0);

    // Start recording timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log("Could not start recognition:", e.message);
      setConversationState("IDLE");
      setIsRecording(false);
    }
  }, []);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    setIsRecording(false);
    setConversationState("IDLE");
    setTranscript("");

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  }, []);

  // Format thời gian recording
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Kiểm tra đăng nhập
  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isChatbotOpen) {
      checkLoginStatus();
    }
  }, [isChatbotOpen]);

  const checkLoginStatus = () => {
    const loggedIn = storage.isAuthenticated();
    setIsLoggedIn(loggedIn);
    return loggedIn;
  };

  // Load chat history khi mở chatbot
  useEffect(() => {
    if (isChatbotOpen && messages.length === 0) {
      if (checkLoginStatus()) {
        loadChatHistory();
      } else {
        setMessages([
          {
            id: 1,
            text: "Xin chào! Tôi là trợ lý AI của Sắc Bùa Phú Lễ. Vui lòng đăng nhập để trò chuyện với tôi.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isChatbotOpen]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format tin nhắn
  const formatMessage = (text) => {
    if (!text) return "";

    let formattedText = text;

    // Loại bỏ các ký tự định dạng markdown
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "$1");
    formattedText = formattedText.replace(/\*(.*?)\*/g, "$1");
    formattedText = formattedText.replace(/__(.*?)__/g, "$1");
    formattedText = formattedText.replace(/_(.*?)_/g, "$1");
    formattedText = formattedText.replace(/~~(.*?)~~/g, "$1");

    // Xử lý các ký tự * ở đầu dòng
    formattedText = formattedText.replace(/^\s*\*\s+/gm, "• ");
    formattedText = formattedText.replace(/^\s*-\s+/gm, "• ");
    formattedText = formattedText.replace(/^\s*\+\s+/gm, "• ");

    // Xử lý link
    formattedText = formattedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">$1</a>'
    );

    formattedText = formattedText.replace(
      /\[(https?:\/\/[^\s\]]+)\]/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">$1</a>'
    );

    formattedText = formattedText.replace(
      /\[(https?:\/\/[^\s\]]+)\]/g,
      (match, url) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">Xem video YouTube</a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-blue-600 hover:text-blue-800">${url}</a>`;
      }
    );

    return formattedText;
  };

  // Load lịch sử chat từ API
  const loadChatHistory = async () => {
    if (!checkLoginStatus()) return;

    setIsLoadingHistory(true);
    const token = storage.getAccessToken();
    try {
      const response = await fetch(`${CHAT_HISTORY_API}?page=0&size=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const formattedMessages = data.data
          .sort((a, b) => new Date(a.createAt) - new Date(b.createAt))
          .flatMap((chat) => [
            {
              id: `user-${chat.id}`,
              text: chat.userMessage,
              isBot: false,
              timestamp: new Date(chat.createAt),
            },
            {
              id: `bot-${chat.id}`,
              text: formatMessage(chat.botResponse),
              isBot: true,
              timestamp: new Date(chat.createAt),
            },
          ]);

        setMessages(formattedMessages);
        setChatHistory(data.data);
      } else {
        setMessages([
          {
            id: 1,
            text: "Xin chào! Tôi là trợ lý AI của Sắc Bùa Phú Lễ. Tôi có thể giúp gì cho bạn?",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([
        {
          id: 1,
          text: "Xin chào! Tôi là trợ lý AI của Sắc Bùa Phú Lễ. Tôi có thể giúp gì cho bạn?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Xóa lịch sử chat
  const clearChatHistory = async () => {
    if (!checkLoginStatus()) return;

    try {
      const token = storage.getAccessToken();
      await fetch(`${API_BASE_URL}/api/chat/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setMessages([
        {
          id: 1,
          text: "Xin chào! Tôi là trợ lý AI của Sắc Bùa Phú Lễ. Cuộc trò chuyện mới đã bắt đầu. Tôi có thể giúp gì cho bạn?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setChatHistory([]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  // Gửi tin nhắn đến API
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!inputMessage.trim() || !checkLoginStatus()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const token = storage.getAccessToken();
    try {
      const response = await axios(
        `${SEND_MESSAGE_API}?message=${encodeURIComponent(inputMessage)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      console.log(response);
      const data = response.data;
      console.log(data);

      const botMessage = {
        id: Date.now() + 1,
        text: formatMessage(
          data || data.data || "Tôi không thể xử lý câu hỏi này ngay lúc này."
        ),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi click vào câu hỏi mẫu
  const handleSampleQuestionClick = (question) => {
    if (!checkLoginStatus()) return;

    const userMessage = {
      id: Date.now(),
      text: question,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const token = storage.getAccessToken();
    axios(`${SEND_MESSAGE_API}?message=${encodeURIComponent(question)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        const data = response.data;
        const botMessage = {
          id: Date.now() + 1,
          text: formatMessage(
            data || data.data || "Tôi không thể xử lý câu hỏi này ngay lúc này."
          ),
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        const errorMessage = {
          id: Date.now() + 1,
          text: "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Hiệu ứng counter cho stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const stepDuration = duration / steps;

          const usersStep = 500 / steps;
          const projectsStep = 1000 / steps;
          const satisfactionStep = 95 / steps;

          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            setCounters({
              users: Math.min(500, Math.floor(usersStep * currentStep)),
              projects: Math.min(1000, Math.floor(projectsStep * currentStep)),
              satisfaction: Math.min(
                95,
                Math.floor(satisfactionStep * currentStep)
              ),
            });

            if (currentStep >= steps) {
              clearInterval(timer);
            }
          }, stepDuration);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Hiệu ứng cho features section khi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Hàm định dạng thời gian
  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm định dạng ngày tháng
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN");
  };

  // Kiểm tra xem có phải là ngày mới không
  const isNewDay = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    return (
      formatDate(currentMsg.timestamp) !== formatDate(previousMsg.timestamp)
    );
  };

  // Kiểm tra xem có phải là lần đầu chat không
  const isFirstTimeChat = () => {
    return messages.length === 1 && messages[0].isBot;
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Get status text for voice chat
  const getVoiceStatusText = () => {
    switch (conversationState) {
      case "LISTENING":
        return "Đang nghe... Nói điều bạn muốn";
      case "ANALYZING":
        return "Đang phân tích...";
      case "SPEAKING":
        return "AI đang trả lời...";
      default:
        return "Nhấn nút mic để bắt đầu trò chuyện";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-slide-down">
              Bảo Tồn Văn Hóa Việt Nam
              <br />
              <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent text-3xl md:text-4xl lg:text-5xl">
                cùng Trí Tuệ Nhân Tạo
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-delay">
              Khám phá và trải nghiệm di sản văn hóa phi vật thể qua công nghệ
              trí tuệ nhân tạo hiện đại. Từ điệu múa truyền thống đến lời ca dân
              gian, chúng tôi giúp bạn kết nối với văn hóa Việt Nam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                to="/dancing"
                className="group px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
              >
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/cultural-history"
                className="px-6 py-3 bg-white text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-all border-2 border-slate-200 hover:border-slate-300 text-base"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          {/* Banner Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto animate-fade-in">
            <div className="aspect-[21/10] bg-gradient-to-r from-red-100 via-amber-100 to-red-100">
              <img
                src={imgBanner}
                alt="Vietnamese traditional culture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 bg-white">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Khám phá các công cụ AI hiện đại giúp bạn trải nghiệm và bảo tồn
              văn hóa Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 ${
                  feature.borderColor
                } transition-all hover:shadow-lg flex flex-col h-full ${
                  isVisible ? "animate-feature-in" : "opacity-0 translate-y-8"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                <div className="relative flex flex-col h-full">
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={feature.path}
                      className={`${feature.textColor} font-medium hover:gap-2 flex items-center gap-1 transition-all group-hover:translate-x-1 text-sm`}
                    >
                      Trải nghiệm ngay
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-[95rem] mx-auto mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.users}+
            </div>
            <div className="text-gray-600 text-sm">Người dùng</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.projects}+
            </div>
            <div className="text-gray-600 text-sm">Dự án đã tạo</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.satisfaction}%
            </div>
            <div className="text-gray-600 text-sm">Hài lòng</div>
          </div>
        </div>
      </section>

      {/* Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {!isChatbotOpen && !isVoiceChatOpen ? (
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="relative w-16 h-16 rounded-full flex items-center justify-center group animate-pulse hover:animate-none transition-all duration-300 hover:scale-110"
              style={{
                boxShadow: "0 0 0 2px #dc2626, 0 10px 25px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={chatbotIcon}
                alt="Chatbot"
                className="w-10 h-10 object-contain"
              />

              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>

              <div className="absolute -top-1 -left-1 bg-white rounded-full p-0.5 shadow-sm">
                <MessageCircle className="w-3 h-3 text-red-600" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsChatbotOpen(false);
                setIsVoiceChatOpen(false);
                stopListening();
              }}
              className="relative w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all hover:scale-110"
              style={{
                boxShadow: "0 0 0 2px white, 0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Chatbot Interface */}
          {isChatbotOpen && (
            <div className="absolute bottom-full right-0 mb-4">
              <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[75vh] max-h-[700px] flex flex-col border border-gray-200 overflow-hidden">
                {/* Header với nút chuyển sang voice chat */}
                <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <img
                          src={chatbotIcon}
                          alt="Chatbot"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">Trợ lý AI</h3>
                        <p className="text-xs opacity-90">Đang trực tuyến</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsChatbotOpen(false);
                        setIsVoiceChatOpen(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Mic className="w-3 h-3" />
                      Voice Chat
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
                >
                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <React.Fragment key={message.id}>
                          {/* Hiển thị ngày tháng khi có sự thay đổi */}
                          {isNewDay(message, messages[index - 1]) && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </div>
                            </div>
                          )}

                          <div
                            className={`flex ${
                              message.isBot ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 ${
                                message.isBot
                                  ? "bg-white border border-gray-200 rounded-bl-none"
                                  : "bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-br-none"
                              }`}
                            >
                              <div
                                className={`text-sm whitespace-pre-wrap ${
                                  !message.isBot ? "text-white" : ""
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: message.text,
                                }}
                              />
                              <p
                                className={`text-xs mt-1 ${
                                  message.isBot
                                    ? "text-gray-500"
                                    : "text-red-100"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{
                              animationDelay: "0.1s",
                            }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{
                              animationDelay: "0.2s",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Container cho câu hỏi mẫu và input */}
                <div className="bg-white">
                  {/* Câu hỏi mẫu */}
                  {!isLoadingHistory && isFirstTimeChat() && isLoggedIn && (
                    <div className="p-4 pb-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleSampleQuestionClick("Sắc bùa Phú Lễ là gì?")
                          }
                          className="inline-flex bg-white border border-red-300 rounded-full px-3 py-1 text-xs text-gray-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                          Sắc bùa Phú Lễ là gì?
                        </button>
                        <button
                          onClick={() =>
                            handleSampleQuestionClick("Lịch sử sắc bùa Phú Lễ?")
                          }
                          className="inline-flex bg-white border border-red-300 rounded-full px-3 py-1 text-xs text-gray-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                          Lịch sử sắc bùa Phú Lễ?
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form input */}
                  <form
                    onSubmit={handleSendMessage}
                    className={`p-4 ${
                      !isLoadingHistory && isFirstTimeChat() && isLoggedIn
                        ? "border-t border-gray-200 pt-2"
                        : ""
                    }`}
                  >
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                          isLoggedIn
                            ? "Nhập câu hỏi của bạn..."
                            : "Vui lòng đăng nhập để sử dụng trợ lý AI"
                        }
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        disabled={isLoading || isLoadingHistory || !isLoggedIn}
                      />
                      <button
                        type="submit"
                        disabled={
                          !inputMessage.trim() ||
                          isLoading ||
                          isLoadingHistory ||
                          !isLoggedIn
                        }
                        className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full p-2 hover:from-red-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {isLoggedIn
                          ? "Trợ lý AI hiểu biết về văn hóa Việt Nam"
                          : "Vui lòng đăng nhập để chat với AI"}
                      </p>
                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={clearChatHistory}
                          className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                          title="Xóa lịch sử chat"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa lịch sử
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Voice Chat Interface */}
          {isVoiceChatOpen && (
            <div className="absolute bottom-full right-0 mb-4">
              <div className="bg-white rounded-2xl shadow-2xl w-[400px] h-[75vh] max-h-[700px] flex flex-col border border-gray-200 overflow-hidden">
                {/* Header Voice Chat - Đơn giản */}
                <div className="bg-gradient-to-r from-red-600 to-amber-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsVoiceChatOpen(false);
                        setIsChatbotOpen(true); // Quay lại chatbot, không đóng
                        stopListening();
                      }}
                      className="flex items-center gap-2 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm">Trợ lý AI</span>
                    </button>
                    <div className="text-right">
                      <h3 className="font-semibold text-sm">Voice Chat</h3>
                      <p className="text-xs opacity-90">Realtime</p>
                    </div>
                  </div>
                </div>

                {/* Voice Chat Content - Minimalist */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
                  {/* Trạng thái kết nối */}
                  <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          conversationState === "LISTENING"
                            ? "bg-green-500 animate-pulse"
                            : conversationState === "ANALYZING"
                            ? "bg-yellow-500 animate-pulse"
                            : conversationState === "SPEAKING"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {getVoiceStatusText()}
                      </span>
                    </div>
                  </div>

                  {/* Transcript Display */}
                  {(transcript || conversationState === "LISTENING") && (
                    <div className="mb-6 text-center w-full">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 mx-4">
                        <p className="text-sm text-gray-700">
                          {transcript || "Đang nghe..."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recording Status */}
                  {isRecording && (
                    <div className="mb-6 text-center">
                      <div className="text-2xl font-mono text-red-600 font-bold mb-2">
                        {formatRecordingTime(recordingTime)}
                      </div>
                      <div className="flex justify-center mt-4">
                        {/* Audio waveform animation */}
                        <div className="flex items-end space-x-1 h-8">
                          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, index) => (
                            <div
                              key={index}
                              className="w-1 bg-red-500 rounded-full animate-pulse"
                              style={{
                                height: `${height * 4}px`,
                                animationDelay: `${index * 0.1}s`,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Voice Recording Button - Center */}
                  <div className="mt-8">
                    {!isRecording ? (
                      <button
                        onClick={startListening}
                        disabled={
                          conversationState === "ANALYZING" ||
                          conversationState === "SPEAKING" ||
                          !isLoggedIn
                        }
                        className="w-20 h-20 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          boxShadow:
                            "0 0 0 4px white, 0 8px 30px rgba(220, 38, 38, 0.3)",
                        }}
                      >
                        <Mic className="w-8 h-8" />
                      </button>
                    ) : (
                      <button
                        onClick={stopListening}
                        className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all hover:scale-110 animate-pulse"
                        style={{
                          boxShadow:
                            "0 0 0 4px white, 0 8px 30px rgba(220, 38, 38, 0.5)",
                        }}
                      >
                        <Square className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  {/* Instruction Text */}
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 max-w-xs">
                      {!isLoggedIn
                        ? "Vui lòng đăng nhập để sử dụng voice chat"
                        : conversationState === "IDLE"
                        ? "Nhấn nút mic để bắt đầu trò chuyện bằng giọng nói realtime"
                        : getVoiceStatusText()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thêm CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes featureIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-slide-down {
          animation: slideDown 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.5s both;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 0.8s both;
        }
        .animate-feature-in {
          animation: featureIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default Home;
