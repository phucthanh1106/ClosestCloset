# build
Thuộc tính build nói cho Docker biết: "Image này chưa có sẵn trên Docker Hub, hãy tự đóng gói (build) nó từ mã nguồn của tôi theo hướng dẫn trong file Dockerfile." Ta chỉ dùng khi ta tự viết source code (như folder ./server, ./client, ./chatbot). Vì Docker không thể tải code riêng của bạn từ internet về, nó phải đọc Dockerfile trong thư mục đó để cài npm install, copy code và đóng gói thành image.

# depends_on
Thuộc tính depends_on dùng để quy định thứ tự khởi động (startup order) giữa các container.
=> Bản chất vấn đề: Khi bạn gõ lệnh docker compose up, nếu không có chỉ dẫn, Docker sẽ khởi động tất cả container cùng một lúc. Điều này dẫn đến lỗi: API server vừa bật lên đã cố gắng kết nối tới cơ sở dữ liệu, nhưng lúc đó container db (MongoDB) hoặc redis vẫn chưa khởi chạy xong => server crash ngay lập tức.

# networks
1. closestcloset: (Tên mạng)
Đây là tên định danh bạn tự đặt cho mạng nội bộ này.

Mọi service được khai báo networks: - closestcloset (như server, worker, db, redis, client) sẽ được Docker cắm chung vào một "switch mạng ảo" có tên này.

Những container không nằm trong mạng closestcloset sẽ hoàn toàn bị cách ly, không thể nhìn thấy hay gửi gói tin vào cụm này.

2. driver: bridge (Cơ chế cầu nối mạng)
bridge là kiểu mạng mặc định và phổ biến nhất trong Docker khi chạy trên một máy đơn lẻ:

Tạo dải IP nội bộ riêng: Docker sẽ tạo ra một card mạng ảo trên máy host (thường có dải IP như 172.18.0.x). Mỗi container tham gia mạng này sẽ được cấp một IP nội bộ riêng.

Cách ly với bên ngoài: Các container có thể gọi ra internet (ví dụ gọi Gemini API), nhưng từ bên ngoài internet hay máy tính khác trong mạng LAN không thể tự do chui vào từng IP nội bộ của container, trừ khi bạn cố tình mở cổng bằng lệnh ports: - "4000:4000".

3. Tính năng quan trọng nhất: Automatic DNS / Service Discovery
Đây là lý do chính khiến bạn cần khai báo mạng bridge tự tạo:

Trong Docker, khi bạn tự tạo một mạng user-defined bridge (closestcloset), Docker sẽ tự động bật một hệ thống DNS nội bộ (Internal DNS):

Thay vì phải nhớ IP động của container (như 172.18.0.2), các container có thể gọi nhau trực tiếp bằng tên service được đặt trong file compose.

Trong file code của bạn:

Kết nối Redis: redis://redis:6379 hoặc redis://redis_container:6379

Kết nối MongoDB: mongodb://db:27017/closestcloset

Vite proxy sang API: http://server_container:4000

Docker sẽ tự động phân giải tên redis, db, server_container thành địa chỉ IP chính xác trong mạng closestcloset mà bạn không bao giờ phải sửa file cấu hình khi IP bị đổi.