-- ==============================================================================
-- STUDYFLOW AI - SAMPLE SEED DATA FOR SUPABASE
-- ==============================================================================
-- Dữ liệu mẫu ban đầu cho ngân hàng câu hỏi trắc nghiệm
-- ==============================================================================

INSERT INTO public.quiz_questions 
(subject_id, subject_name, topic, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty)
VALUES
(
    'eco101', 
    'Kinh tế vi mô', 
    'Độ co giãn của cầu',
    'Khi giá của hàng hóa X tăng 10% làm cho lượng cầu của hàng hóa X giảm 20%, hệ số co giãn của cầu theo giá (ED) là bao nhiêu?',
    'ED = -0.5 (Cầu kém co giãn)',
    'ED = -2.0 (Cầu co giãn nhiều)',
    'ED = -1.0 (Cầu co giãn đơn vị)',
    'ED = 0 (Cầu hoàn toàn không co giãn)',
    'B',
    'Công thức: ED = % Delta Q / % Delta P = (-20%) / (+10%) = -2. Vì |ED| = 2 > 1 nên cầu co giãn nhiều theo giá.',
    'medium'
),
(
    'eco101', 
    'Kinh tế vi mô', 
    'Cân bằng thị trường',
    'Điều gì xảy ra với giá và lượng cân bằng của hàng hóa thông thường khi thu nhập của người tiêu dùng tăng lên (các yếu tố khác không đổi)?',
    'Giá cân bằng tăng, lượng cân bằng giảm',
    'Giá cân bằng giảm, lượng cân bằng tăng',
    'Cả giá và lượng cân bằng đều tăng',
    'Cả giá và lượng cân bằng đều giảm',
    'C',
    'Đối với hàng hóa thông thường, thu nhập tăng làm đường cầu dịch chuyển sang phải (D tăng). Khi cung không đổi, giá cân bằng (P*) và lượng cân bằng (Q*) đều tăng.',
    'easy'
),
(
    'eco102', 
    'Kinh tế vĩ mô', 
    'Tổng sản phẩm quốc nội (GDP)',
    'Khoản mục nào sau đây ĐƯỢC TÍNH vào GDP của Việt Nam trong năm hiện hành?',
    'Một chiếc xe máy cũ được mua bán lại giữa hai người dân',
    'Giá trị dịch vụ cắt tóc được thực hiện trong năm nay',
    'Tiền trợ cấp thất nghiệp mà chính phủ chi trả cho người lao động',
    'Giao dịch mua cổ phiếu trên sàn chứng khoán',
    'B',
    'GDP chỉ tính giá trị thị trường của hàng hóa và dịch vụ CUỐI CÙNG được SẢN XUẤT MỚI trong kỳ. Hàng cũ, trợ cấp chính phủ (chuyển giao thu nhập) và giao dịch tài chính không được tính vào GDP.',
    'medium'
),
(
    'acc101', 
    'Nguyên lý kế toán', 
    'Phương trình kế toán',
    'Một doanh nghiệp mua sắm một thiết bị máy móc trị giá 50 triệu đồng bằng tiền gửi ngân hàng. Nghiệp vụ này ảnh hưởng như thế nào đến phương trình kế toán?',
    'Tổng tài sản tăng 50 triệu, nợ phải trả tăng 50 triệu',
    'Tổng tài sản không đổi, cơ cấu tài sản thay đổi',
    'Tổng tài sản giảm 50 triệu, vốn chủ sở hữu giảm 50 triệu',
    'Tổng tài sản tăng 50 triệu, vốn chủ sở hữu tăng 50 triệu',
    'B',
    'Tài sản "Thiết bị máy móc" tăng 50 triệu, đồng thời tài sản "Tiền gửi ngân hàng" giảm 50 triệu. Tổng tài sản không thay đổi, chỉ hoán chuyển hình thái tài sản.',
    'easy'
),
(
    'fin101', 
    'Quản trị tài chính', 
    'Giá trị thời gian của tiền',
    'Nếu bạn gửi tiết kiệm 100 triệu đồng với lãi suất 8%/năm theo phương thức lãi kép hàng năm, sau 2 năm bạn sẽ nhận được cả gốc và lãi là bao nhiêu?',
    '116.000.000 VNĐ',
    '116.640.000 VNĐ',
    '108.000.000 VNĐ',
    '120.000.000 VNĐ',
    'B',
    'Áp dụng công thức lãi kép: FV = PV * (1 + r)^n = 100 * (1 + 0.08)^2 = 100 * 1.1664 = 116.64 triệu đồng.',
    'medium'
);
