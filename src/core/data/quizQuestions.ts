export interface QuizQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
  takeaway?: string;
  optionsAnalysis?: string[];
}

export const ECONOMICS_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "eco-q1",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Khái niệm cơ bản & Đối tượng nghiên cứu",
    q: "Câu phát biểu nào sau đây Đúng:",
    options: [
      "Chi phí cơ hội là giá trị của cơ hội xấu nhất phải từ bỏ để có được cái mong muốn",
      "Những điểm nằm trên đường giới hạn khả năng sản xuất cho biết nguồn lực được sử dụng chưa hiệu quả",
      "Kinh tế học Vĩ mô nghiên cứu toàn bộ nền kinh tế như một tổng thể",
      "Kinh tế học vi mô nghiên cứu về các vấn đề lạm phát và thất nghiệp",
    ],
    correct: 2,
    explanation: "Kinh tế học Vĩ mô nghiên cứu toàn bộ nền kinh tế như một tổng thể (tăng trưởng, lạm phát, thất nghiệp).",
    takeaway: "Phân biệt cốt lõi: Vi mô nghiên cứu hành vi của từng tác nhân đơn lẻ (hộ gia đình, doanh nghiệp); Vĩ mô nghiên cứu toàn bộ nền kinh tế tổng thể.",
    optionsAnalysis: [
      "Sai - Chi phí cơ hội là giá trị của cơ hội TỐT NHẤT bị bỏ qua (chứ không phải cơ hội xấu nhất).",
      "Sai - Những điểm nằm TRÊN đường PPF biểu thị nguồn lực đã được sử dụng HIỆU QUẢ tối đa.",
      "ĐÚNG - Đây là định nghĩa chuẩn của Kinh tế học Vĩ mô.",
      "Sai - Lạm phát và thất nghiệp thuộc phạm vi nghiên cứu của Kinh tế học Vĩ mô.",
    ],
  },
  {
    id: "eco-q2",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Đường giới hạn khả năng sản xuất (PPF)",
    q: "Điều nào sau đây KHÔNG gây ra sự dịch chuyển đường giới hạn khả năng sản xuất:",
    options: [
      "Một trận mưa lớn gây ngập lụt đường phố",
      "Sự cải tiến trong phương pháp sản xuất",
      "Sự gia tăng nguồn lực lao động của một nước",
      "Tỷ lệ thất nghiệp giảm",
    ],
    correct: 3,
    explanation: "Thất nghiệp giảm chỉ làm chuyển dịch điểm sản xuất từ bên trong đường PPF tiến dần ra đường PPF (tăng hiệu quả sử dụng lao động hiện có), chứ không làm dịch chuyển bản thân đường PPF.",
    takeaway: "Đường PPF chỉ dịch chuyển khi tiềm năng nguồn lực hoặc công nghệ thay đổi. Thay đổi mức độ thất nghiệp chỉ di chuyển điểm hoạt động bên trong PPF.",
    optionsAnalysis: [
      "Sai - Thiên tai/ngập lụt phá hủy hạ tầng sẽ làm giảm năng lực sản xuất (dịch chuyển PPF vào trong).",
      "Sai - Tiến bộ công nghệ/phương pháp sản xuất làm dịch chuyển PPF ra ngoài.",
      "Sai - Tăng lực lượng lao động mở rộng nguồn lực sản xuất (dịch chuyển PPF ra ngoài).",
      "ĐÚNG - Tỷ lệ thất nghiệp giảm không làm dịch chuyển đường PPF, chỉ di chuyển vị trí điểm sản xuất từ trong tiến ra biên.",
    ],
  },
  {
    id: "eco-q3",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Mô hình kinh tế",
    q: "Đồ thị nào nêu lên các kết hợp khác nhau của hai hàng hoá mà nền kinh tế có thể sản xuất ra?",
    options: [
      "Đường đẳng lượng",
      "Đường giới hạn khả năng sản xuất",
      "Đường đẳng ích",
      "Đường đẳng phí",
    ],
    correct: 1,
    explanation: "Đường giới hạn khả năng sản xuất (Production Possibilities Frontier - PPF) biểu thị các kết hợp tối đa của 2 hàng hóa mà nền kinh tế có thể sản xuất khi sử dụng toàn bộ nguồn lực hiệu quả.",
    takeaway: "PPF (Production Possibility Frontier) = Mô hình 2 hàng hóa phản ánh đánh đổi, chi phí cơ hội và tính hiệu quả.",
    optionsAnalysis: [
      "Sai - Đường đẳng lượng biểu thị các kết hợp đầu vào (K, L) để tạo ra cùng mức sản lượng.",
      "ĐÚNG - Định nghĩa chính xác của đường giới hạn khả năng sản xuất (PPF).",
      "Sai - Đường đẳng ích biểu thị các giỏ hàng mang lại cùng mức thỏa dụng cho người tiêu dùng.",
      "Sai - Đường đẳng phí biểu thị các kết hợp đầu vào mà doanh nghiệp mua được với cùng mức chi phí.",
    ],
  },
  {
    id: "eco-q4",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Tính khan hiếm",
    q: "Khan hiếm là vấn đề:",
    options: [
      "Hiệu quả sản xuất không còn nữa",
      "Không tồn tại trong nền kinh tế của nước giàu",
      "Nảy sinh khi năng suất tăng chậm lại",
      "Nguồn lực là hữu hạn còn nhu cầu của con người là vô hạn",
    ],
    correct: 3,
    explanation: "Quy luật khan hiếm: Nguồn lực xã hội luôn có hạn (hữu hạn) trong khi nhu cầu của con người là vô hạn, dẫn đến việc phải lựa chọn phương án sử dụng tối ưu.",
    takeaway: "Tính khan hiếm (Scarcity) là vấn đề vĩnh cửu của mọi nền kinh tế, dù giàu hay nghèo.",
    optionsAnalysis: [
      "Sai - Khan hiếm buộc nền kinh tế phải nâng cao hiệu quả sản xuất.",
      "Sai - Ngay cả các quốc gia giàu có nhất vẫn đối mặt với sự khan hiếm về thời gian và tài nguyên.",
      "Sai - Khan hiếm tồn tại khách quan do giới hạn vật chất chứ không phụ thuộc tốc độ tăng năng suất.",
      "ĐÚNG - Nguồn lực hữu hạn đối lập với nhu cầu vô hạn là bản chất của tính khan hiếm.",
    ],
  },
  {
    id: "eco-q5",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Bản chất Kinh tế học",
    q: "Kinh tế học ra đời bắt nguồn từ vấn đề thực tiễn cần giải quyết là:",
    options: [
      "Nguồn tài nguyên là có hạn và nhu cầu của con người là có hạn",
      "Các nguồn tài nguyên đã được phân bổ một cách hợp lý",
      "Nguồn tài nguyên là có hạn và nhu cầu của con người là vô hạn",
      "Nguồn tài nguyên chưa được khai thác hết để đáp ứng cho nhu cầu của con người",
    ],
    correct: 2,
    explanation: "Mâu thuẫn cơ bản của mọi xã hội là nguồn tài nguyên có hạn trong khi nhu cầu con người là vô tận, thúc đẩy kinh tế học nghiên cứu cách phân bổ nguồn lực hiệu quả nhất.",
    takeaway: "Gốc rễ của Kinh tế học: Giải quyết bài toán phân bổ nguồn lực khan hiếm để thỏa mãn tối đa nhu cầu vô hạn.",
    optionsAnalysis: [
      "Sai - Nhu cầu con người không bao giờ có hạn.",
      "Sai - Nếu đã phân bổ hợp lý hoàn hảo thì không cần kinh tế học giải quyết.",
      "ĐÚNG - Đây là tiền đề căn bản cho sự ra đời của khoa học kinh tế.",
      "Sai - Vấn đề không chỉ là khai thác mà là quy luật giới hạn tự nhiên của nguồn lực.",
    ],
  },
  {
    id: "eco-q6",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Mục tiêu nghiên cứu",
    q: "Kinh tế học nghiên cứu làm thế nào để:",
    options: [
      "Các nguồn lực khan hiếm được sử dụng tốt nhất để thỏa mãn những nhu cầu vô hạn",
      "Chúng ta chọn lựa được việc sử dụng các nguồn lực vô hạn",
      "Các nguồn lực vô hạn được sử dụng để thỏa mãn những nhu cầu có hạn",
      "Một xã hội không cần phải lựa chọn",
    ],
    correct: 0,
    explanation: "Kinh tế học giúp xã hội trả lời câu hỏi lựa chọn: làm sao để phân bổ nguồn lực khan hiếm nhằm thỏa mãn tối đa nhu cầu vô hạn của con người.",
  },
  {
    id: "eco-q7",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Khoa học xã hội",
    q: "Kinh tế học là môn khoa học xã hội:",
    options: [
      "Nghiên cứu hành vi trong sản xuất, trao đổi và sử dụng hàng hoá, dịch vụ",
      "Nghiên cứu xem xã hội giải quyết vấn đề khan hiếm như thế nào",
      "Nghiên cứu xem xã hội quyết định các vấn đề sản xuất cái gì, sản xuất như thế nào và sản xuất cho ai",
      "Tất cả các câu trên đều đúng",
    ],
    correct: 3,
    explanation: "Kinh tế học bao quát cả hành vi sản xuất - tiêu dùng, cách xã hội đối phó với sự khan hiếm và quyết định 3 vấn đề kinh tế cơ bản: Sản xuất cái gì? Như thế nào? Cho ai?",
  },
  {
    id: "eco-q8",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Phân loại thị trường",
    q: "Kinh tế học vi mô chủ yếu quan tâm đến cách phân loại thị trường theo:",
    options: [
      "Loại sản phẩm bán trên thị trường",
      "Cơ cấu cạnh tranh",
      "Khu vực địa lý",
      "Ba ý trên đều đúng",
    ],
    correct: 3,
    explanation: "Trong kinh tế vi mô, thị trường được phân loại đa chiều: theo tính chất hàng hóa/sản phẩm, cơ cấu mức độ cạnh tranh (cạnh tranh hoàn hảo, độc quyền, độc quyền nhóm) và phạm vi không gian địa lý.",
  },
  {
    id: "eco-q9",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Góc độ tiếp cận",
    q: "Kinh tế học vi mô tiếp cận với những nghiên cứu kinh tế dưới góc độ:",
    options: [
      "Thị trường chứng khoán",
      "Sự quản lý điều hành của chính phủ",
      "Toàn bộ nền kinh tế như một tổng thể",
      "Sự hoạt động của các thị trường riêng lẻ",
    ],
    correct: 3,
    explanation: "Kinh tế vi mô (Microeconomics) xem xét hành vi của các tế bào kinh tế độc lập: người tiêu dùng, doanh nghiệp và sự vận hành của từng thị trường hàng hóa/dịch vụ riêng lẻ.",
  },
  {
    id: "eco-q10",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Đường PPF & Hiệu quả kinh tế",
    q: "Lựa chọn tại một điểm nằm bên trong đường giới hạn khả năng sản xuất là:",
    options: [
      "Thực hiện được nhưng nền kinh tế hoạt động không hiệu quả",
      "Không thể thực hiện được",
      "Thực hiện được và nền kinh tế hoạt động hiệu quả",
      "Tất cả các điều trên đều đúng",
    ],
    correct: 0,
    explanation: "Điểm nằm trong đường PPF là điểm khả thi (thực hiện được) nhưng thể hiện nguồn lực bị lãng phí hoặc thất nghiệp (hoạt động không hiệu quả).",
  },
  {
    id: "eco-q11",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Ý nghĩa điểm trên đường PPF",
    q: "Những điểm nằm trên đường giới hạn khả năng sản xuất cho biết:",
    options: [
      "Những mức sản lượng tối đa mà nền kinh tế có thể sản xuất được khi sử dụng hết và có hiệu quả nguồn tài nguyên",
      "Những mức sản lượng mà nền kinh tế không sản xuất được do nguồn tài nguyên khan hiếm",
      "Những mức sản lượng mà nền kinh tế có thể sản xuất được khi sử dụng chưa hết nguồn tài nguyên",
      "Tất cả các câu trên đều sai",
    ],
    correct: 0,
    explanation: "Điểm nằm trên đường PPF đại diện cho trạng thái hiệu quả Pareto: mức sản lượng tối đa có thể đạt được khi toàn bộ nguồn tài nguyên được khai thác trọn vẹn và đạt hiệu quả tối ưu.",
  },
  {
    id: "eco-q12",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Kinh tế thực chứng vs Chuẩn tắc",
    q: "Những nhận định kinh tế đề cập đến những giải thích mang tính khách quan hoặc khoa học về sự vận hành của nền kinh tế:",
    options: [
      "Kinh tế vĩ mô",
      "Kinh tế vi mô",
      "Kinh tế chuẩn tắc",
      "Kinh tế thực chứng",
    ],
    correct: 3,
    explanation: "Kinh tế thực chứng (Positive Economics) mô tả, giải thích các sự kiện kinh tế khách quan 'nó là gì / xảy ra như thế nào', có thể kiểm chứng được bằng dữ liệu thực tế (khác với kinh tế chuẩn tắc mang tính phán xét 'nên như thế nào').",
  },
  {
    id: "eco-q13",
    subjectId: "eco101",
    subjectName: "Kinh tế vi mô",
    topic: "Dịch chuyển đường PPF",
    q: "Tiến bộ kỹ thuật sẽ làm dịch chuyển đường giới hạn khả năng sản xuất theo hướng:",
    options: [
      "Xuống dưới và sang trái.",
      "Về phía gốc tọa độ.",
      "Sang trái và tiến về trục tung.",
      "Lên trên và sang phải",
    ],
    correct: 3,
    explanation: "Tiến bộ khoa học công nghệ làm tăng năng suất lao động và mở rộng năng lực sản xuất tối đa của nền kinh tế, khiến đường PPF dịch chuyển ra ngoài: lên trên và sang phải.",
  },
];

export const GENERAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "eng-q1",
    subjectId: "eng102",
    subjectName: "Tiếng Anh chuyên ngành",
    topic: "Vocabulary Basic",
    q: "Which word means 'Trường học' in English?",
    options: ["Hospital", "School", "Supermarket", "Station"],
    correct: 1,
    explanation: "School nghĩa là trường học.",
  },
  {
    id: "math-q1",
    subjectId: "math101",
    subjectName: "Giải tích 1",
    topic: "Toán học cơ bản",
    q: "Kết quả của phép tính: 15 + 27 = ?",
    options: ["32", "42", "45", "52"],
    correct: 1,
    explanation: "15 + 27 = 42.",
  },
  {
    id: "eng-q2",
    subjectId: "eng102",
    subjectName: "Tiếng Anh chuyên ngành",
    topic: "Antonyms",
    q: "Find the opposite of 'Difficult':",
    options: ["Hard", "Slow", "Easy", "Fast"],
    correct: 2,
    explanation: "Từ trái nghĩa với Difficult (khó khăn) là Easy (dễ dàng).",
  },
];

/**
 * Lấy danh sách câu hỏi theo môn học.
 * Nếu môn là 'eco101' hoặc 'Kinh tế vi mô', trả về toàn bộ bộ câu hỏi Kinh tế vi mô vừa bổ sung.
 */
export function getQuestionsBySubject(subjectIdOrName?: string, count: number = 5): QuizQuestion[] {
  const norm = (subjectIdOrName || "").toLowerCase();
  if (norm.includes("eco") || norm.includes("kinh tế") || norm.includes("vi mô") || norm.includes("vĩ mô")) {
    return count >= ECONOMICS_QUIZ_QUESTIONS.length
      ? ECONOMICS_QUIZ_QUESTIONS
      : ECONOMICS_QUIZ_QUESTIONS.slice(0, count);
  }

  // Kết hợp ngân hàng câu hỏi tổng hợp
  const combined = [...ECONOMICS_QUIZ_QUESTIONS, ...GENERAL_QUIZ_QUESTIONS];
  return combined.slice(0, Math.min(count, combined.length));
}
