---
id: chuong-15-phan-2
title: 'Chương 15 · Stream chuẩn và toán tử nhập xuất'
---

Phần này theo mục 15.2.2–15.3.3, trang 751–757 của sách.

## Stream toàn cục và đồng bộ

Ngoài `cin`, `cout`, `cerr`, `clog` dùng `char`, thư viện có `wcin`, `wcout`, `wcerr`, `wclog` dùng `wchar_t` cho các kênh tương ứng. `wchar_t` không mặc định bảo đảm một mã hóa Unicode giống nhau trên mọi hệ thống. Các alias stream thông dụng trong sách dành cho `char` và `wchar_t`, dù traits của `char16_t` và `char32_t` cũng có từ C++11.

Mặc định, các stream chuẩn C++ được đồng bộ với stream C tương ứng, hỗ trợ trộn I/O C và C++ theo quy tắc đồng bộ. Có thể gọi `std::ios::sync_with_stdio(false)` **trước mọi I/O** để tắt đồng bộ khi không cần; nếu gọi sau khi I/O đã xảy ra, hành vi phụ thuộc implementation. Khi đã tắt, không giả định thứ tự hiển thị giữa `printf` và `cout` được giữ như lúc đồng bộ.

C++11 bảo đảm truy cập đồng thời các stream chuẩn đã đồng bộ không gây data race; các ký tự từ nhiều thread vẫn có thể xen nhau. Khi cần một thông điệp nguyên vẹn, dùng đồng bộ thích hợp; từ C++20 có `std::osyncstream` cho trường hợp phù hợp. Với stream khác hoặc stream chuẩn đã tắt đồng bộ, phải tuân thủ quy tắc thread-safety của đối tượng và dùng khóa khi có truy cập gây race.

## Header

| Header | Thành phần chính |
| --- | --- |
| `<iosfwd>` | Khai báo trước các lớp stream; hữu ích trong header chỉ cần tham chiếu hoặc con trỏ. |
| `<streambuf>` | Định nghĩa lớp stream buffer cơ sở. |
| `<istream>`, `<ostream>` | Giao diện stream nhập và xuất; `<istream>` cũng định nghĩa `basic_iostream`. |
| `<iostream>` | Các stream chuẩn toàn cục. |
| `<iomanip>` | Manipulator có tham số và công cụ định dạng. |
| `<fstream>`, `<sstream>` | File stream và string stream. |
| `<strstream>` | Giao diện cũ được sách nhắc; nên ưu tiên string stream trong mã mới. |

Dùng header định nghĩa những thành phần thực sự cần; không tự forward-declare `ostream` như một class thông thường vì nó là alias của template specialization.

## Toán tử `<<` và `>>`

Các toán tử được overload cho nhiều kiểu cơ bản và thư viện, đồng thời có thể định nghĩa cho kiểu của mình. `<<` trả output stream, `>>` trả input stream, cho phép nối nhiều thao tác. Đừng dựa vào thứ tự đánh giá mọi biểu thức con trong ví dụ cũ của sách khi có tác dụng phụ; quy tắc sequencing phụ thuộc phiên bản C++.

```cpp
#include <bitset>
#include <complex>
#include <iostream>
#include <string>

int main() {
    std::string s("hello, world");
    std::bitset<10> flags(7);
    std::complex<float> c(3.1f, 7.4f);
    std::cout << s << '\n' << flags << '\n' << c << '\n';
}
```

`>>` thường bỏ khoảng trắng đầu theo cờ `skipws`; có thể tắt cờ hoặc dùng `get()` để đọc cả khoảng trắng. Nếu nhập số thất bại, stream đặt trạng thái lỗi; phải kiểm tra stream thay vì giả định biến luôn giữ giá trị cũ. Nếu không có dữ liệu hoặc stream đã lỗi trước thao tác, biến có thể không bị thay đổi.

## Các kiểu đặc biệt

- `bool` mặc định được đọc và ghi bằng 0 hoặc 1; `std::boolalpha` chuyển sang tên true/false theo locale. Đầu vào số không hợp lệ có thể đặt `failbit`.
- `char` và `wchar_t` đọc bằng `>>` bỏ khoảng trắng đầu theo `skipws`; `get()` đọc ký tự không theo cách đó.
- Đọc C-string vào buffer cần giới hạn kích thước và chừa chỗ null. Sách dùng `char buf[81]; std::cin >> std::setw(81) >> buf;` với `<iomanip>`. Ưu tiên `std::string` để không tự quản lý kích thước. Các overload mảng/con trỏ khác nhau theo phiên bản chuẩn.
- In `char*` thường in chuỗi C-string; để in địa chỉ đối tượng, chuyển sang `const void*`. Hình thức địa chỉ phụ thuộc implementation và không nên xem địa chỉ in ra là định danh bền vững.
- Toán tử stream buffer có thể chuyển ký tự giữa stream và buffer; sách bàn thêm về sao chép file và stream buffer ở các mục sau.

```cpp
const char* text = "hello";
std::cout << text << " at " << static_cast<const void*>(text) << '\n';
```

## Đọc và ghi ngày giờ

Từ C++11, `put_time` và `get_time` trong `<iomanip>` định dạng và phân tích `std::tm` theo locale. Luôn cung cấp đối tượng `tm` hợp lệ, khởi tạo trước và kiểm tra stream:

```cpp
#include <iomanip>
#include <iostream>
#include <sstream>
#include <ctime>

int main() {
    std::tm date{};
    std::istringstream input("2024-03-12");
    if (input >> std::get_time(&date, "%Y-%m-%d"))
        std::cout << std::put_time(&date, "%Y-%m-%d") << '\n';
}
```

:::warning Đính chính ví dụ sách
Ví dụ trang 757 khai báo `tm* date;` chưa khởi tạo rồi truyền vào `get_time`; con trỏ đó không trỏ tới đối tượng hợp lệ. Dùng `std::tm date{}` và `&date` như trên. Khi dùng `std::localtime`, cũng phải kiểm tra con trỏ trả về trước khi dereference và lưu ý quy tắc đồng thời của implementation.
:::

Các manipulator tiền tệ và ngày giờ có xét locale; xem chương 16 để biết chi tiết.
