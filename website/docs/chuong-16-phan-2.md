---
id: chuong-16-phan-2
title: 'Chương 16 · Character traits và khái niệm locale'
---

Phần này theo mục 16.1.4–16.2, trang 853–859. Character traits định nghĩa các thao tác cơ bản cho kiểu ký tự; locale tập hợp các quy tắc có thể thay đổi theo môi trường hoặc quy ước.

## `std::char_traits`

`basic_string` và các lớp stream nhận traits làm tham số template, mặc định là `std::char_traits<CharT>`. Các specialization cho `char`, `wchar_t`, `char16_t`, `char32_t` được sách C++11 nêu; sách in nhầm `char32` ở một chỗ, tên đúng là `char32_t`.

| Thành viên | Vai trò |
| --- | --- |
| `char_type`, `int_type` | Kiểu ký tự và kiểu có thể biểu diễn thêm EOF. |
| `pos_type`, `off_type`, `state_type` | Kiểu vị trí, offset và trạng thái chuyển đổi. |
| `assign(a,b)`, `eq(a,b)`, `lt(a,b)` | Gán, so sánh bằng và thứ tự từng ký tự. |
| `length(s)` | Đếm đến ký tự kết thúc mặc định. |
| `compare(a,b,n)` | So sánh tối đa `n` phần tử theo traits. |
| `copy(dst,src,n)`, `move(dst,src,n)` | Sao chép `n` phần tử; `move` hỗ trợ vùng chồng lấn, `copy` yêu cầu không chồng lấn. |
| `assign(dst,n,c)`, `find(s,n,c)` | Gán lặp ký tự hoặc tìm ký tự trong phạm vi. |
| `eof()`, `to_int_type`, `to_char_type`, `not_eof`, `eq_int_type` | Biểu diễn, chuyển đổi và kiểm tra ký tự/EOF. |

Các hàm có số lượng làm việc trên phạm vi được chỉ định; null bên trong không tự kết thúc phép so sánh hoặc sao chép. Riêng `length()` tìm ký tự kết thúc nên cần chuỗi hợp lệ được kết thúc. `int_type` cho phép biểu diễn cả ký tự lẫn EOF; kiểm tra EOF trước khi chuyển sang `char_type`.

```cpp
#include <cassert>
#include <string>

int main() {
    typedef std::char_traits<char> traits;
    const char data[] = {'A', '\0', 'B'};
    char copy[3];
    traits::copy(copy, data, 3);
    assert(copy[1] == '\0' && copy[2] == 'B');
    assert(traits::find(copy, 3, 'B') == copy + 2);
    traits::int_type value = traits::to_int_type('A');
    assert(!traits::eq_int_type(value, traits::eof()));
    assert(traits::to_char_type(value) == 'A');
}
```

Sách minh họa một implementation dùng các hàm như `memcpy`, `memmove`, `memcmp`; đó là mô hình giải thích, không phải yêu cầu phải triển khai bằng các hàm C đó. Traits riêng có thể thay đổi quy tắc so sánh, như ví dụ string không phân biệt hoa thường ở chương 13.

### Phân biệt ký tự với EOF

Khi đọc từng ký tự qua stream buffer, giữ kết quả ở `int_type` cho đến sau khi kiểm tra EOF. Nếu chuyển về `char` trước, một giá trị byte hợp lệ có thể bị nhầm với dấu kết thúc trên những hệ thống dùng `char` có dấu.

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    using traits = std::char_traits<char>;
    const std::string bytes(1, static_cast<char>(0xFF));
    std::istringstream input(bytes);
    traits::int_type first = input.rdbuf()->sbumpc();
    assert(!traits::eq_int_type(first, traits::eof()));
    assert(traits::eq(traits::to_char_type(first), bytes[0]));
    traits::int_type end = input.rdbuf()->sbumpc();
    assert(traits::eq_int_type(end, traits::eof()));
}
```

`eq_int_type` so sánh ở kiểu có thể biểu diễn EOF; chỉ gọi `to_char_type` sau khi đã xác định đây là ký tự. `not_eof` giữ nguyên một giá trị khác EOF; với EOF nó trả một giá trị khác EOF do implementation chọn, chứ không khôi phục được một ký tự đã đọc.

### Sao chép vùng chồng lấn

`copy` phù hợp hai vùng không chồng lấn; `move` hỗ trợ cả vùng chồng lấn. Chúng nhận **số lượng chính xác** phần tử, nên ký tự null nằm giữa vùng dữ liệu vẫn được sao chép:

```cpp
#include <cassert>
#include <string>

int main() {
    char buffer[] = {'a', '\0', 'b', 'c'};
    std::char_traits<char>::move(buffer + 1, buffer, 3);
    assert(buffer[0] == 'a' && buffer[1] == 'a');
    assert(buffer[2] == '\0' && buffer[3] == 'b');
}
```

## `widen` và `narrow`

`basic_ios::widen(char)` và `narrow(char_type, fallback)` sử dụng facet `ctype` của locale gắn với stream. Ví dụ `out.widen('\n')` tạo ký tự newline phù hợp kiểu ký tự của stream; đây là cách `endl` tổng quát hóa cho stream hẹp và rộng. Facet cũng truy cập được bằng `std::use_facet<std::ctype<CharT>>(loc)`.

Hai hàm này chuyển đổi từng ký tự theo quy tắc facet, không phải cơ chế tổng quát để giải mã hoặc mã hóa chuỗi UTF-8 nhiều byte.

## Locale là gì?

Một locale gói các quy tắc, như ký hiệu thập phân, tên Boolean, định dạng ngày giờ, phân loại ký tự và sắp xếp. C++ cho phép các đối tượng locale khác nhau tồn tại cùng lúc và gắn riêng cho từng stream; locale cũng có thể mở rộng bằng facet riêng.

Sách nêu quy ước tên thường gặp trên hệ POSIX `language[_area[.code]][@modifier]`, ví dụ `de_DE.UTF-8`. Tên cụ thể và locale được cài đặt phụ thuộc hệ điều hành, nên không giả định một tên khu vực sẽ có trên mọi máy. Locale `"C"` và `std::locale::classic()` là điểm xuất phát portable cho quy ước cổ điển.

Trên các hệ thống có hỗ trợ, locale môi trường thường được cấu hình qua `LANG` và các biến `LC_*`; quy tắc ưu tiên là đặc thù nền tảng. Locale của C được quản lý qua `setlocale`, còn locale C++ là đối tượng có thể gắn riêng cho stream. Việc thay global locale có thể ảnh hưởng các thành phần khác trong chương trình và cần cân nhắc đồng thời.

```cpp
#include <cassert>
#include <locale>
#include <sstream>

int main() {
    std::istringstream in("3.5");
    in.imbue(std::locale::classic());
    double value = 0;
    assert(in >> value);
    assert(value == 3.5);
}
```

Sách minh họa nhập theo classic locale rồi xuất theo locale Đức; tạo locale theo tên có thể ném `std::runtime_error` nếu tên không khả dụng, vì thế chương trình thực tế cần xử lý trường hợp đó.
