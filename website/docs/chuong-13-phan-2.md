---
id: chuong-13-phan-2
title: 'Chương 13 · Kiểu string, khởi tạo và C-string'
---

Phần này theo mục 13.2.1–13.2.4, trang 663–669 của sách.

## Template và các kiểu chuỗi

`<string>` định nghĩa template cơ sở:

```cpp
template<class CharT, class Traits = std::char_traits<CharT>,
         class Allocator = std::allocator<CharT>>
class basic_string;
```

`CharT` là kiểu phần tử; `Traits` định nghĩa các thao tác cơ bản như sao chép và so sánh ký tự; `Allocator` quản lý cấp phát bộ nhớ. Traits và allocator có giá trị mặc định. Sách trình bày traits tự viết ở mục 13.2.15 và allocator ở chương 19.

| Kiểu | Chuyên biệt hóa | Ghi chú |
| --- | --- | --- |
| `std::string` | `basic_string<char>` | Chuỗi phần tử `char`. |
| `std::wstring` | `basic_string<wchar_t>` | Kích thước và cách dùng `wchar_t` phụ thuộc nền tảng. |
| `std::u16string` | `basic_string<char16_t>` | Có từ C++11. |
| `std::u32string` | `basic_string<char32_t>` | Có từ C++11. |

Các kiểu dùng cùng giao diện template, nhưng kiểu phần tử không tự đảm bảo văn bản hợp lệ hoặc tự chuyển đổi mã hóa. Với UTF-8 trong `std::string`, `size()` đếm phần tử `char`, thường là byte, không nhất thiết là số ký tự hiển thị.

## Tổng quan thao tác

| Nhóm | Thao tác tiêu biểu |
| --- | --- |
| Tạo, gán, trao đổi | constructor, destructor, `=`, `assign()`, `swap()` |
| Thêm, sửa, xóa | `+=`, `append()`, `push_back()`, `insert()`, `erase()`, `pop_back()`, `clear()`, `resize()`, `replace()`, `+` |
| So sánh | `==`, `!=`, `<`, `<=`, `>`, `>=`, `compare()` |
| Kích thước và bộ nhớ | `empty()`, `size()`, `length()`, `max_size()`, `capacity()`, `reserve()`, `shrink_to_fit()` |
| Truy cập và trích xuất | `[]`, `at()`, `front()`, `back()`, `copy()`, `data()`, `c_str()`, `substr()` |
| Tìm kiếm, iterator | các hàm `find`; `begin/end`, `cbegin/cend`, `rbegin/rend`, `crbegin/crend` |
| Vào ra và chuyển đổi số | `>>`, `getline()`, `<<`; `stoi`, `stol`, `stoll`, `stoul`, `stoull`, `stof`, `stod`, `stold`, `to_string`, `to_wstring` |
| Allocator | `get_allocator()` |

Theo sách, `pop_back`, `front`, `back`, `shrink_to_fit`, iterator `c...` và các hàm chuyển đổi số được bổ sung từ C++11. Regex thuộc thư viện riêng được giới thiệu trong C++11, xem chương 14; việc xử lý văn bản như viết hoa hay so sánh không phân biệt hoa thường cần thêm công cụ khác.

## Các dạng đối số

Các overload nhận dữ liệu theo nhiều dạng. Không phải thao tác nào cũng hỗ trợ tất cả dạng; chọn đúng overload trong tài liệu tham khảo của thao tác.

| Dạng | Dữ liệu dùng |
| --- | --- |
| `str` | Toàn bộ string. |
| `str, pos, count` | Tối đa `count` phần tử của `str`, bắt đầu tại `pos`. |
| `cstr` | C-string tới trước ký tự null đầu tiên. |
| `chars, len` | Chính xác `len` phần tử từ mảng hợp lệ. |
| `c` hoặc `count, c` | Một ký tự hoặc `count` bản sao ký tự, tùy thao tác. |
| `begin, end` | Phạm vi iterator nửa mở `[begin, end)`. |
| initializer list | Các phần tử trong danh sách, từ C++11. |

Chỉ dạng C-string không kèm độ dài dùng null làm dấu kết thúc. Các dạng có độ dài hoặc iterator có thể chứa `\0` như một phần tử bình thường; `std::string` vì vậy có thể lưu dữ liệu nhị phân. Không truyền con trỏ null vào overload yêu cầu C-string hợp lệ.

```cpp
#include <string>

std::string a("nico");      // bốn phần tử
std::string b("nico", 5);   // năm phần tử, gồm cả null cuối literal
std::string c(5, '\0');     // năm phần tử null
```

`a.size()` là 4, `b.size()` và `c.size()` là 5. Cần bảo đảm phạm vi mảng có ít nhất số phần tử được yêu cầu. Toán tử thường nhận toàn bộ đối tượng làm toán hạng; khi cần chỉ định một phần string hoặc mảng, dùng overload hàm tương ứng như `append` hay `compare`.

## Các constructor

| Cách tạo | Ý nghĩa |
| --- | --- |
| `string s;` | String rỗng. |
| `string s(other);` | Sao chép. |
| `string s(std::move(other));` | Di chuyển; nguồn vẫn hợp lệ nhưng giá trị không xác định cụ thể. |
| `string s(other, pos, count);` | Sao chép tối đa `count` phần tử từ `pos`; có thể bỏ `count`. |
| `string s(cstr);` | Sao chép C-string đến trước null đầu tiên. |
| `string s(chars, len);` | Sao chép đúng `len` phần tử hợp lệ. |
| `string s(count, ch);` | Tạo `count` bản sao của `ch`. |
| `string s(first, last);` | Sao chép phạm vi iterator `[first, last)`. |
| `string s({'x', 'y'});` | Khởi tạo từ danh sách, từ C++11. |

Không có constructor nhận một `char` duy nhất: `std::string s('x')` không hợp lệ. Có thể dùng `std::string s(1, 'x')` hoặc `std::string s({'x'})`. Đối tượng tự hủy và giải phóng tài nguyên khi kết thúc thời gian sống.

## Giao tiếp với C-string

C-string có thể được dùng trong nhiều thao tác kết hợp với string, và có chuyển đổi từ `const char*` hợp lệ sang `std::string`. Không có chuyển đổi ngầm ngược từ string sang con trỏ C-string: dùng `c_str()` hoặc `data()` khi cần.

Từ C++11, `c_str()` và `data()` cho phép đọc dãy gồm các phần tử của string và ký tự null tại `size()`. Null nằm **bên trong** string vẫn được lưu, nhưng hàm C xử lý C-string sẽ dừng tại null đầu tiên. Trước C++11, `data()` không đảm bảo có null ở cuối.

`copy(dest, count, pos)` sao chép tối đa `count` phần tử từ `pos` vào bộ đệm do người gọi cung cấp, trả về số phần tử đã sao chép và **không** tự thêm null. Bộ đệm phải đủ lớn; nếu cần C-string, hãy dành thêm chỗ và thêm null thủ công.

```cpp
#include <string>

std::string s("12345");
const char* p = s.c_str(); // do s sở hữu, không free
char buffer[6];
std::string::size_type n = s.copy(buffer, sizeof(buffer) - 1);
buffer[n] = '\0';
```

Con trỏ nhận từ `c_str()` trỏ vào bộ nhớ do string quản lý. Việc sửa hoặc hủy string có thể làm con trỏ mất hiệu lực; nên lấy con trỏ ngay trước lời gọi cần dùng và không giữ qua thao tác thay đổi string. Trong C++11, không được sửa dữ liệu qua `data()`; overload `data()` trả con trỏ có thể sửa xuất hiện từ C++17, nhưng vẫn phải tuân thủ giới hạn và quy tắc ký tự kết thúc.

Sách cũng cảnh báo `NULL` có thể là hằng số nguyên 0 và gây chọn overload ngoài ý muốn. `nullptr` giúp thể hiện rõ con trỏ, nhưng **không** biến một con trỏ null thành C-string hợp lệ.
