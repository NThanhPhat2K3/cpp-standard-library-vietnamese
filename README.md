# 📚 The C++ Standard Library — Bản đọc tiếng Việt

> Cùng đọc *The C++ Standard Library: A Tutorial and Reference*, ấn bản thứ hai của Nicolai M. Josuttis, qua website Docusaurus bằng tiếng Việt.

📖 **Đọc trực tuyến:** [C++ Standard Library — Bản đọc tiếng Việt](https://nthanhphat2k3.github.io/cpp-standard-library-vietnamese/)

## 🧭 Bắt đầu

Website hiện có nội dung trải từ chương 1 đến chương 19, với các phần nhỏ, ví dụ C++ và hình được chọn từ sách gốc. **Bản đọc đang được hoàn thiện và đối chiếu:** đã có trang cho mỗi chương không đồng nghĩa mọi chi tiết, ví dụ và hình trong sách đã được kiểm tra đầy đủ.

| Chương | Chủ đề | Bắt đầu đọc trong mã nguồn |
| --- | --- | --- |
| 01 | Giới thiệu sách | [Chương 1](website/docs/chuong-01.md) |
| 02 | C++ và thư viện chuẩn | [Chương 2](website/docs/chuong-02.md) |
| 03 | Tính năng ngôn ngữ | [Chương 3](website/docs/chuong-03-phan-1.md) |
| 04 | Các khái niệm chung | [Chương 4](website/docs/chuong-04-phan-1.md) |
| 05 | Tiện ích thư viện | [Chương 5](website/docs/chuong-05-phan-1.md) |
| 06 | Tổng quan STL | [Chương 6](website/docs/chuong-06-mau.md) |
| 07 | Container STL | [Chương 7](website/docs/chuong-07-phan-1.md) |
| 08 | Thành viên container | [Chương 8](website/docs/chuong-08-phan-1.md) |
| 09 | Iterator | [Chương 9](website/docs/chuong-09-phan-1.md) |
| 10 | Function object và lambda | [Chương 10](website/docs/chuong-10-phan-1.md) |
| 11 | Thuật toán STL | [Chương 11](website/docs/chuong-11-phan-1.md) |
| 12 | Container adapter và bitset | [Chương 12](website/docs/chuong-12-phan-1.md) |
| 13 | Chuỗi | [Chương 13](website/docs/chuong-13-phan-1.md) |
| 14 | Biểu thức chính quy | [Chương 14](website/docs/chuong-14-phan-1.md) |
| 15 | Stream và nhập xuất | [Chương 15](website/docs/chuong-15-phan-1.md) |
| 16 | Quốc tế hóa | [Chương 16](website/docs/chuong-16-phan-1.md) |
| 17 | Tính toán số | [Chương 17](website/docs/chuong-17-phan-1.md) |
| 18 | Xử lý đồng thời | [Chương 18](website/docs/chuong-18-phan-1.md) |
| 19 | Allocator | [Chương 19](website/docs/chuong-19-phan-1.md) |

Thanh điều hướng của website dẫn tới các phần tiếp theo trong từng chương. Các trang ghi phạm vi hoặc số trang sách để tiện đối chiếu; ví dụ và ghi chú hiện đại có thể bổ sung hoặc điều chỉnh cách trình bày so với nguyên tác.

Các trang hiện có 56 đường dẫn tới ảnh trong `website/static/img/`; đã kiểm tra các tệp này đều tồn tại. Số lượng ảnh hoặc việc website build được **không chứng minh** bản dịch đã bao phủ đầy đủ nội dung hay từng ảnh đã được đối chiếu về chất lượng và ngữ cảnh. Công việc rà soát vẫn tiếp tục.

## 🌐 Chạy website

Cần Node.js 20 trở lên và npm:

```bash
cd website
npm install
npm start
```

Mở địa chỉ được in trong terminal, thường là `http://localhost:3000`. Để kiểm tra bản dựng tĩnh:

```bash
cd website
npm run build
npm run serve
```

## 🗂️ Cấu trúc

- `website/docs/`: nội dung từng chương dưới dạng Markdown.
- `website/static/img/`: hình minh họa được chọn từ sách.
- `website/sidebars.js`: thứ tự các trang trên thanh điều hướng.
- `website/src/`: giao diện và định dạng của website.
- `chuong-01/`: bản mẫu chương 1 ban đầu.

Sách gốc là ấn bản năm 2012, tập trung vào C++11. Những thay đổi ở phiên bản C++ sau đó được bổ sung theo ngữ cảnh và cần phân biệt với mô tả lịch sử trong sách. Tệp PDF gốc nằm tại thư mục này.

## 🚀 Cập nhật GitHub Pages

Sau khi commit và push thay đổi lên nhánh `main`, chạy lệnh dưới đây từ thư mục `website` để build và cập nhật nhánh `gh-pages`. Máy cần có quyền push vào repository và đã cấu hình đăng nhập GitHub cho Git.

```bash
GIT_USER=NThanhPhat2K3 npm run deploy
```

GitHub Pages xuất bản nội dung từ nhánh `gh-pages`. Việc push `main` không tự cập nhật website; cần chạy lệnh deploy sau mỗi lần muốn xuất bản bản mới. PDF sách gốc không được đưa vào repository.
