const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType } = require("docx");
const fs = require("fs");
const path = require("path");

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: "7C3AED" },
    margins: { top: 120, bottom: 120, left: 150, right: 150 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: true,
            color: "FFFFFF",
            font: "Segoe UI",
            size: 20, // 10pt
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text, widthPercent, isCode = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    margins: { top: 100, bottom: 100, left: 150, right: 150 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: isCode ? "Consolas" : "Segoe UI",
            size: 19, // 9.5pt
            color: isCode ? "6D28D9" : "333333",
          }),
        ],
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 32, // 16pt
        color: "4C1D95",
        font: "Segoe UI",
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        color: "6D28D9",
        font: "Segoe UI",
      }),
    ],
  });
}

function paragraph(text, options = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 100, line: 300 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text: text,
        font: "Segoe UI",
        size: 22, // 11pt
        color: "2D3748",
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function bullet(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 280 },
    children: [
      new TextRun({
        text: boldPrefix,
        font: "Segoe UI",
        size: 22,
        bold: true,
        color: "1F2937",
      }),
      new TextRun({
        text: text,
        font: "Segoe UI",
        size: 22,
        color: "374151",
      }),
    ],
  });
}

function callout(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: "F5F3FF" },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: "7C3AED" },
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
            },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    color: "5B21B6",
                    font: "Segoe UI",
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: text,
                    font: "Segoe UI",
                    size: 20,
                    color: "4B5563",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function main() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch
          },
        },
        children: [
          // Tiêu đề bìa
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 120 },
            children: [
              new TextRun({
                text: "BÁO CÁO TỔNG QUAN DỰ ÁN",
                bold: true,
                size: 24,
                color: "6D28D9",
                font: "Segoe UI",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: "STUDYFLOW AI",
                bold: true,
                size: 48,
                color: "4C1D95",
                font: "Segoe UI",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 },
            children: [
              new TextRun({
                text: "Nền tảng Ôn thi Đại học & Học phần Thông minh ứng dụng AI (Zero-Cost Architecture)",
                italics: true,
                size: 24,
                color: "6B7280",
                font: "Segoe UI",
              }),
            ],
          }),

          callout(
            "🚀 Trạng thái triển khai: PRODUCTION LIVE (100% Zero-Cost)",
            "Dự án đã hoàn tất toàn bộ chu kỳ 5 bước triển khai miễn phí, tích hợp Supabase Database & Media, phát hành trên Vercel Cloud và sẵn sàng phục vụ sinh viên ôn thi mọi lúc mọi nơi."
          ),

          new Paragraph({ spacing: { before: 300 } }),

          // Phần 1
          heading1("1. Giới thiệu Dự án"),
          paragraph(
            "STUDYFLOW AI là nền tảng luyện thi trắc nghiệm và ôn tập đại học thông minh, hướng tới đối tượng sinh viên các trường đại học khối ngành Kinh tế, Quản trị, Kế toán và Công nghệ (UEH, NEU, FTU, v.v.)."
          ),
          paragraph(
            "Dự án được xây dựng với mục tiêu giải quyết bài toán học nhóm nhàm chán bằng cách kết hợp tương tác Voice trực tiếp 1v1, chế độ thách đấu kiến thức (PK Mode), và hệ thống quản lý tiến độ học tập thông minh. Toàn bộ kiến trúc hạ tầng được thiết kế để vận hành 100% miễn phí (Zero-Cost Operation) mà vẫn đảm bảo độ tin cậy, hiệu năng cao và bảo mật tối đa."
          ),

          // Phần 2
          heading1("2. Đường dẫn Trực tuyến & Tài nguyên Hệ thống"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Tài nguyên", 30),
                  createHeaderCell("Địa chỉ liên kết (URL)", 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("🌐 Website Chính thức", 30),
                  createDataCell("https://studyflow-ai-git-main-tan-dcc2.vercel.app", 70, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("🎙️ Sảnh Voice & PK", 30),
                  createDataCell("https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk", 70, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("🔗 Link Mời vào Phòng trực tiếp", 30),
                  createDataCell("https://studyflow-ai-git-main-tan-dcc2.vercel.app/pk?room=VH-1024", 70, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("🐙 Mã nguồn GitHub", 30),
                  createDataCell("https://github.com/minhtanbear-code/studyflow-ai", 70, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("🗄️ Database Supabase", 30),
                  createDataCell("https://zvnmnbhoywksqhjjifff.supabase.co", 70, true),
                ],
              }),
            ],
          }),

          // Phần 3
          heading1("3. Các Tính năng Cốt lõi của Hệ thống"),
          heading2("3.1. Phòng Voice Học 1 vs 1 & Thách Đấu PK (Live Micro & Sóng âm)"),
          bullet("Phòng thoại đôi tương tác: ", "Hai sinh viên có thể tham gia cùng một phòng để cùng thảo luận, giải đề trắc nghiệm từng câu theo thời gian thực."),
          bullet("Microphone Live WebRTC: ", "Tự động nhận diện tín hiệu âm thanh thu từ mic của sinh viên kèm visualizer sóng âm động trực quan."),
          bullet("Nhạc nền Lofi thư giãn: ", "Tích hợp danh sách phát nhạc nền lofi nhẹ nhàng giúp giữ tinh thần thoải mái, tăng cường độ tập trung."),

          heading2("3.2. Tính năng Nhập Mã Phòng & Tự động kết nối qua Link mời"),
          bullet("Modal Nhập mã Calm UI: ", "Giao diện tối giản, tự động chuyển đổi chữ hoa cho mã phòng, kiểm tra định dạng và chống nhầm lẫn."),
          bullet("Nút Dán Clipboard tiện lợi: ", "Cho phép sinh viên lấy mã phòng từ clipboard chỉ bằng 1 nút bấm."),
          bullet("Tự động nhận diện URL (?room=...): ", "Chủ phòng tạo phòng và bấm 'Sao chép link mời' gửi bạn bè. Khi bạn bè mở link, hệ thống tự động giải mã tham số và đưa thẳng vào phòng học 1v1 mà không phải cấu hình lại."),
          bullet("Phòng mẫu thử nghiệm: ", "Mã 'VH-1024' (Kinh tế vi mô), 'VH-2048' (Nguyên lý kế toán), 'PK-3096' (Kinh tế vĩ mô)."),

          heading2("3.3. Tùy chỉnh Cấu hình Đề thi Chuyên sâu"),
          bullet("Số lượng câu hỏi linh hoạt: ", "Lựa chọn 5, 10, 15, 20 câu hoặc nhập số lượng câu hỏi tùy ý."),
          bullet("4 Cấp độ thử thách: ", "Dễ (Easy), Trung bình (Medium), Khó (Hard), Cực khó (Expert)."),
          bullet("Định dạng đề thi: ", "Hỗ trợ câu hỏi trắc nghiệm 1 đáp án, nhiều đáp án đúng, câu hỏi kèm sơ đồ / biểu đồ hình ảnh."),

          heading2("3.4. Hệ sinh thái Tiện ích Học tập Toàn diện"),
          bullet("Check-in Thói quen: ", "Theo dõi số ngày học liên tục (streak) giúp tạo động lực học đều đặn."),
          bullet("Khảo sát & Lộ trình: ", "Phân tích điểm yếu môn học để đưa ra gợi ý ôn luyện trúng trọng tâm kỳ thi."),
          bullet("SchoolGenZ & Thống kê: ", "Báo cáo điểm số, tỷ lệ trả lời đúng theo từng chủ đề môn học."),

          // Phần 4
          heading1("4. Kiến trúc Kỹ thuật & Giải pháp Zero-Cost (0 Đồng)"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Lớp kiến trúc", 25),
                  createHeaderCell("Công nghệ / Nền tảng", 35),
                  createHeaderCell("Ưu điểm & Giải pháp", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Frontend Framework", 25),
                  createDataCell("Next.js 16.4.6 (Turbopack) + React 19", 35),
                  createDataCell("Tốc độ biên dịch siêu tốc, hoàn toàn không dính lỗ hổng CVE, hỗ trợ App Router và SSR/SSG.", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Styling & Giao diện", 25),
                  createDataCell("Tailwind CSS 3.4.17 + Lucide React", 35),
                  createDataCell("Ngôn ngữ thiết kế Calm UI, màu tím pastel thư giãn, responsive 100% trên cả điện thoại và máy tính.", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Cơ sở dữ liệu", 25),
                  createDataCell("Supabase PostgreSQL Free Tier", 35),
                  createDataCell("PostgreSQL đám mây 500MB miễn phí, đầy đủ RLS, hỗ trợ truy vấn thời gian thực.", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("API Client", 25),
                  createDataCell("Supabase REST Client (Zero-Dependency)", 35),
                  createDataCell("Giao tiếp qua HTTP REST tiêu chuẩn, kích thước bundle cực nhẹ, không gây xung đột dependency.", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Lưu trữ Media", 25),
                  createDataCell("Supabase Storage (studyflow-media)", 35),
                  createDataCell("Lưu ảnh minh họa câu hỏi, sơ đồ tài liệu với CDN public truy xuất tốc độ cao.", 40),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell("Hosting & Tên miền", 25),
                  createDataCell("Vercel App Cloud Hosting", 35),
                  createDataCell("Tên miền SSL miễn phí, CI/CD tự động phát hành ngay khi có commit mới trên nhánh main.", 40),
                ],
              }),
            ],
          }),

          // Phần 5
          heading1("5. Thiết kế Cơ sở Dữ liệu (Supabase Schema)"),
          paragraph("Hệ thống quản lý dữ liệu thông qua 4 bảng quan hệ được thiết kế chuẩn mực:"),
          bullet("profiles: ", "Lưu trữ thông tin sinh viên, trường đại học (UEH, NEU, FTU...), chuyên ngành, avatar và điểm tích lũy."),
          bullet("quiz_questions: ", "Ngân hàng câu hỏi trắc nghiệm gồm nội dung câu hỏi, danh sách đáp án JSON, đáp án đúng, giải thích chi tiết, độ khó và link ảnh."),
          bullet("pk_rooms: ", "Lưu trữ thông tin phòng thi gồm mã phòng (room_code độc nhất), tên phòng, mã môn học, tên chủ phòng (host), khách tham gia (guest), trạng thái ('waiting' | 'active' | 'completed') và cấu hình đề thi."),
          bullet("study_records: ", "Lịch sử buổi học, điểm số đạt được, tổng số câu hỏi và thời gian làm bài của sinh viên."),

          // Phần 6
          heading1("6. Quy trình Triển khai 5 Bước Chuẩn Mực"),
          bullet("Bước 1 - Lập trình Giao diện & Tính năng: ", "Phát triển toàn bộ màn hình theo kiến trúc module hóa sạch sẽ."),
          bullet("Bước 2 - Kiểm thử Cục bộ (Localhost): ", "Chạy thử trên cổng 3000, kiểm tra tương thích trình duyệt và phản hồi âm thanh."),
          bullet("Bước 3 - Đẩy Mã nguồn lên GitHub: ", "Quản lý phiên bản trên kho minhtanbear-code/studyflow-ai với nhánh chính main."),
          bullet("Bước 4 - Thiết lập Database & Media: ", "Khởi tạo schema và nạp dữ liệu mẫu ngân hàng đề thi lên Supabase."),
          bullet("Bước 5 - Phát hành Tên miền Vercel Cloud: ", "Liên kết tự động GitHub - Vercel, kiểm tra chứng chỉ HTTPS và xác nhận 100% online."),

          // Phần 7
          heading1("7. Kết luận & Định hướng Phát triển"),
          paragraph(
            "STUDYFLOW AI là một minh chứng thực tế cho việc xây dựng một sản phẩm giáo dục số hiện đại, trực quan, phục vụ hàng ngàn sinh viên với chi phí vận hành hạ tầng bằng 0 đồng. Trong các phiên bản tiếp theo, hệ thống có thể mở rộng thêm mô hình AI phân tích giọng nói chấm điểm tự động và tính năng tạo bộ đề trắc nghiệm tự động từ file slide bài giảng PDF."
          ),
          
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "TP. Hồ Chí Minh, Ngày 15 tháng 11 năm 2026\nĐội ngũ Phát triển STUDYFLOW AI",
                italics: true,
                bold: true,
                color: "6B7280",
                font: "Segoe UI",
                size: 20,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, "..", "BAO_CAO_DU_AN_STUDYFLOW_AI.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log("Successfully generated:", outputPath);
}

main().catch(console.error);
