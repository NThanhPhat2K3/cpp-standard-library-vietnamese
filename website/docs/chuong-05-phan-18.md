---
id: chuong-05-phan-18
title: 'Chương 5 · cstddef, cstdlib và cstring'
sidebar_label: '05 · Phần 18: Các header tương thích C'
---

# 5.8 · `<cstddef>`, `<cstdlib>` và `<cstring>`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 161–163 (PDF trang 190–192). Các hộp ghi chú là phần bổ sung hoặc đính chính.

Ba header tương thích C thường dùng trong C++ này tương ứng với `<stddef.h>`, `<stdlib.h>` và `<string.h>`. Chúng cung cấp các hằng, macro, kiểu và hàm phổ biến.

## 5.8.1 `<cstddef>`

| Định danh | Ý nghĩa |
|:---|:---|
| `NULL` | Macro biểu thị hằng con trỏ null. |
| `std::nullptr_t` | Kiểu của `nullptr`, từ C++11. |
| `std::size_t` | Kiểu số nguyên không dấu cho kích thước. |
| `std::ptrdiff_t` | Kiểu số nguyên có dấu cho hiệu hai con trỏ hợp lệ. |
| `std::max_align_t` | Kiểu có yêu cầu căn chỉnh ít nhất bằng mọi kiểu scalar được hỗ trợ trong phạm vi chuẩn. |
| `offsetof(type, member)` | Macro cho offset theo byte của thành viên phù hợp trong kiểu. |

*Bảng 5.26, trang 161.* Trước C++11, `NULL` thường được dùng cho con trỏ null; `nullptr` làm ý định rõ hơn và tránh một số vấn đề chọn overload. `NULL` cũng được cung cấp bởi nhiều header tương thích C khác như `<cstdio>`, `<cstdlib>`, `<cstring>`, `<ctime>`, `<cwchar>` và `<clocale>`.

:::note Góc nhìn hiện đại
Mô tả của sách rằng `NULL` luôn là đúng kiểu `int` hoặc `long` với giá trị `0` là quá hẹp đối với C++ hiện đại: nó là một **hằng con trỏ null do implementation định nghĩa** và có thể là một integer literal có giá trị zero hoặc prvalue kiểu `std::nullptr_t` theo quy tắc phiên bản tương ứng. Không giả định kiểu cụ thể của macro; ưu tiên `nullptr`. `offsetof` có những ràng buộc về kiểu, đặc biệt đối với non-standard-layout class.
:::

## 5.8.2 `<cstdlib>`: kết thúc chương trình

| Định nghĩa | Ý nghĩa |
|:---|:---|
| `EXIT_SUCCESS` | Giá trị trạng thái biểu thị thành công. |
| `EXIT_FAILURE` | Giá trị trạng thái biểu thị thất bại. |
| `std::exit(status)` | Kết thúc bình thường, thực hiện các bước dọn dẹp theo quy định. |
| `std::quick_exit(status)` | Kết thúc nhanh, gọi các handler đăng ký bằng `at_quick_exit`. |
| `std::_Exit(status)` | Kết thúc ngay, không thực hiện dọn dẹp thông thường. |
| `std::abort()` | Kết thúc bất thường. |
| `std::atexit(func)` | Đăng ký hàm không đối số chạy khi kết thúc bình thường. |
| `std::at_quick_exit(func)` | Đăng ký hàm không đối số chạy khi quick exit. |

*Bảng 5.27, trang 162.* `EXIT_SUCCESS` và `EXIT_FAILURE` có thể dùng với `exit` hoặc làm giá trị trả về của `main`.

Các hàm đăng ký qua `atexit` được gọi khi chương trình kết thúc bình thường, theo thứ tự ngược đăng ký, cùng những quy tắc tương tác với hủy đối tượng static. Điều này áp dụng khi gọi `std::exit` hoặc khi rời `main` bình thường. Nếu một handler để ngoại lệ thoát ra, `std::terminate` được gọi.

`std::exit` thực hiện việc hủy đối tượng có thời hạn lưu trữ tĩnh và các bước xử lý luồng C theo quy định. `std::abort` kết thúc bất thường mà không thực hiện dọn dẹp thông thường. Gọi trực tiếp các hàm này không unwind stack như ném ngoại lệ, vì thế destructor của các biến cục bộ đang hoạt động không được tự động chạy như khi rời phạm vi bình thường. Khi cần RAII cho biến cục bộ, hãy trả về bình thường hoặc dùng cơ chế ngoại lệ phù hợp.

Từ C++11, `std::quick_exit` gọi các handler `at_quick_exit` theo thứ tự ngược đăng ký rồi kết thúc mà không thực hiện chuỗi hủy thông thường; `std::_Exit` kết thúc ngay. Không nên dựa vào hai cách này để flush các buffer thông thường. Sách giải thích `quick_exit` được đưa vào một phần để tránh rủi ro các luồng detached truy cập đối tượng static đang bị hủy.

`std::terminate()` là cơ chế kết thúc khi chương trình không thể tiếp tục xử lý ngoại lệ theo quy tắc ngôn ngữ. Handler mặc định gọi `std::abort`; ví dụ có thể xảy ra khi ngoại lệ thoát khỏi hàm `noexcept` hoặc destructor ném trong khi một ngoại lệ khác đang được unwind. Handler có thể được thay thế, nhưng phải kết thúc chương trình.

:::note Góc nhìn hiện đại
Không phải mọi destructor ném ngoại lệ đều ngay lập tức gọi `terminate`: kết quả phụ thuộc đặc tả ngoại lệ của destructor và việc có ngoại lệ khác đang unwind. Các chi tiết flush/đóng stream và thứ tự dọn dẹp cũng phụ thuộc cơ chế kết thúc cụ thể; không coi `exit`, `quick_exit`, `_Exit` và `abort` là tương đương.
:::

## 5.8.3 `<cstring>`: thao tác bộ nhớ

| Hàm | Ý nghĩa |
|:---|:---|
| `std::memchr(ptr, c, len)` | Tìm byte có giá trị tương ứng `c` trong `len` byte đầu. |
| `std::memcmp(p1, p2, len)` | So sánh `len` byte đầu của hai vùng. |
| `std::memcpy(to, from, len)` | Sao chép `len` byte giữa hai vùng không chồng lấn. |
| `std::memmove(to, from, len)` | Sao chép `len` byte; cho phép vùng nguồn và đích chồng lấn. |
| `std::memset(ptr, c, len)` | Ghi giá trị byte tương ứng `c` vào `len` byte đầu. |

*Bảng 5.28, trang 163.* Sách nêu character traits là một nơi ứng dụng các thao tác bộ nhớ mức thấp này.

:::warning Điều kiện bộ nhớ
Các con trỏ, vùng nhớ, độ dài và thời hạn sống phải hợp lệ cho thao tác; `memcpy` với hai vùng chồng lấn là hành vi không xác định, hãy dùng `memmove` khi cần. Sao chép byte không thay thế an toàn copy constructor cho mọi kiểu lớp. `memset` ghi mẫu byte, không nhất thiết tạo ra một giá trị đối tượng hợp lệ hoặc giá trị số mong muốn cho mọi kiểu.
:::
