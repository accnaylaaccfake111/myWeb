// Hàm format lyrics
export const formatLyrics = (rawLyrics) => {
    if (!rawLyrics) return "";

    try {
        let formatted = rawLyrics.toString();

        // 1. Loại bỏ hoàn toàn các dòng đánh dấu số thứ tự (1., 2., 3., ...)
        formatted = formatted.replace(/^\d+\.\s*/gm, "");

        // 2. Loại bỏ hoàn toàn các dòng tiêu đề với ** ** và * *
        formatted = formatted.replace(/^\*\*.*\*\*\s*$/gm, "");
        formatted = formatted.replace(/^\*.*\*\s*$/gm, "");

        // 3. Loại bỏ hoàn toàn các dòng trong ngoặc đơn ở đầu dòng
        formatted = formatted.replace(/^\([^)]*\)\s*$/gm, "");

        // 4. Loại bỏ hoàn toàn các dòng chứa [AI Generated...]
        formatted = formatted.replace(/^.*\[AI Generated.*\].*$/gm, "");

        // 5. Loại bỏ các dòng chỉ chứa ký tự đặc biệt hoặc số
        formatted = formatted.replace(/^[^a-zA-ZÀ-ỹ0-9]*$/gm, "");

        // 6. Xử lý các dòng trống thừa - giữ lại tối đa 2 dòng trống liên tiếp
        formatted = formatted.replace(/\n\s*\n\s*\n/g, "\n\n");

        // 7. Loại bỏ các ký tự đặc biệt không cần thiết ở đầu/cuối
        formatted = formatted.trim();

        // 8. Đảm bảo mỗi dòng được trim và không có khoảng trắng thừa
        const lines = formatted
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => {
                // Loại bỏ các dòng trống và các dòng chỉ chứa ký tự không phải chữ cái
                if (line === "") return false;
                // Kiểm tra xem dòng có chứa ít nhất 1 ký tự chữ cái không
                return /[a-zA-ZÀ-ỹ]/.test(line);
            });

        formatted = lines.join("\n");

        return formatted;
    } catch (error) {
        console.error("Error formatting lyrics:", error);
        return rawLyrics.toString();
    }
};
