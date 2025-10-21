// ThemeSelectionStage.jsx
import { X } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

const ThemeSelectionStage = ({
    onGenerateLyrics,
    isGenerating,
    error,
    onCloseError,
}) => {
    const [theme, setTheme] = useState("");
    const [customTheme, setCustomTheme] = useState("");
    const [selectedMood, setSelectedMood] = useState("");
    const [selectedThemeOption, setSelectedThemeOption] = useState("");
    const [nameTitle, setNameTitle] = useState("");

    // Các chủ đề có sẵn
    const themeOptions = useMemo(
        () => [
            { id: "mở cửa", name: "mở cửa" },
            { id: "mở rào", name: "mở rào" },
            { id: "mở ngõ", name: "mở ngõ" },
            { id: "khai môn", name: "khai môn" },
            { id: "chúc gia chủ", name: "chúc gia chủ" },
            { id: "chúc tụng", name: "chúc tụng" },
            { id: "chúc mùa màng", name: "chúc mùa màng" },
            { id: "ban lộc", name: "ban lộc" },
            { id: "cầu an", name: "cầu an" },
            { id: "cầu phúc", name: "cầu phúc" },
            { id: "quê hương", name: "quê hương" },
            { id: "ca ngợi quê hương", name: "ca ngợi quê hương" },
            { id: "tiễn biệt", name: "tiễn biệt" },
            { id: "kết thúc", name: "kết thúc" },
        ],
        [],
    );

    // Các phong cách/tâm trạng
    const moodOptions = [
        { id: "vui tươi", name: "vui tươi" },
        { id: "phấn khởi", name: "phấn khởi" },
        { id: "rộn ràng", name: "rộn ràng" },
        { id: "trang nghiêm", name: "trang nghiêm" },
        { id: "thành kính", name: "thành kính" },
        { id: "thân mật", name: "thân mật" },
        { id: "dí dỏm", name: "dí dỏm" },
        { id: "hóm hỉnh", name: "hóm hỉnh" },
        { id: "tự hào", name: "tự hào" },
        { id: "yêu quê hương", name: "yêu quê hương" },
        { id: "ân cần", name: "ân cần" },
    ];

    const handleThemeSelect = useCallback(
        (e) => {
            const optionId = e.target.value;
            setSelectedThemeOption(optionId);
            if (optionId) {
                const selected = themeOptions.find(
                    (opt) => opt.id === optionId,
                );
                setTheme(selected.name);
            } else {
                setTheme("");
            }
        },
        [themeOptions],
    );

    const handleCustomThemeChange = useCallback((e) => {
        setCustomTheme(e.target.value);
    }, []);

    const handleMoodSelect = useCallback((e) => {
        setSelectedMood(e.target.value);
    }, []);

    const handleGenerate = useCallback(() => {
        const finalTheme = selectedThemeOption ? theme : customTheme;
        if (!finalTheme) {
            onCloseError("Vui lòng chọn hoặc nhập chủ đề");
            return;
        }
        console.log(nameTitle);
        onGenerateLyrics({
            theme: finalTheme,
            mood: selectedMood,
            customTheme: customTheme || "",
            nameTitle: nameTitle,
        });
    }, [
        theme,
        customTheme,
        selectedThemeOption,
        selectedMood,
        onGenerateLyrics,
    ]);

    return (
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Chọn chủ đề và phong cách
            </h2>

            {error && (
                <div className="relative mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <div className="flex items-start pr-6">
                        <span className="text-xl mr-2">⚠️</span>
                        <div className="flex-1">
                            <strong>Lỗi:</strong>
                            <div className="mt-1 text-sm">{error}</div>
                        </div>
                    </div>
                    <button
                        onClick={onCloseError}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-200 hover:bg-red-300 flex items-center justify-center"
                    >
                        <X className="w-4 h-4 text-red-700" />
                    </button>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập tiêu đề
                </label>
                <input
                    type="text"
                    value={nameTitle}
                    onChange={(v) => {
                        setNameTitle(v.target.value);
                    }}
                    placeholder="Nhập tiêu đề"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn chủ đề
                </label>
                <select
                    value={selectedThemeOption}
                    onChange={handleThemeSelect}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                >
                    <option value="">-- Chọn chủ đề --</option>
                    {themeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                </label>
                <textarea
                    type="text"
                    value={customTheme}
                    onChange={handleCustomThemeChange}
                    placeholder="Nhập ghi chú..."
                    className="w-full h-32 min-h-16 max-h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                />
            </div>

            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phong cách/tâm trạng (tùy chọn)
                </label>
                <select
                    value={selectedMood}
                    onChange={handleMoodSelect}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                >
                    <option value="">-- Chọn phong cách --</option>
                    {moodOptions.map((mood) => (
                        <option key={mood.id} value={mood.id}>
                            {mood.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating || (!theme && !customTheme)}
                className={`w-full py-3 rounded-lg transition-all duration-300 font-semibold text-white shadow-md hover:shadow-lg ${
                    (!theme && !customTheme) || isGenerating
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                }`}
            >
                {isGenerating ? (
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-spin mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Đang sáng tác...
                    </div>
                ) : (
                    "Sáng tác lời bài hát"
                )}
            </button>
        </div>
    );
};

export default ThemeSelectionStage;
