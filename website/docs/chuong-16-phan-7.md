---
id: chuong-16-phan-7
title: 'Chương 16 · Phân loại và chuyển đổi ký tự'
---

Phần này theo mục 16.4.4, trang 891–896. Category `ctype` gồm facet `ctype` để phân loại, chuyển chữ hoa/thường và chuyển đổi từng ký tự, cùng `codecvt` để chuyển đổi giữa các biểu diễn; phần chuyển mã được bàn tiếp ở mục sau.

## Giao diện `ctype`

`std::ctype<CharT>` dùng locale để cung cấp các thao tác sau:

| Hàm | Tác dụng |
| --- | --- |
| `is(mask, c)` | Kiểm tra ký tự có bất kỳ thuộc tính nào trong mask. |
| `is(first, last, masks)` | Ghi mask phân loại cho từng ký tự trong phạm vi. |
| `scan_is(mask, first, last)` | Tìm ký tự đầu tiên khớp mask, hoặc trả `last`. |
| `scan_not(mask, first, last)` | Tìm ký tự đầu tiên không khớp mask. |
| `toupper`, `tolower` | Chuyển một ký tự hoặc cả phạm vi theo locale. |
| `widen`, `narrow` | Chuyển giữa `char` và `CharT` từng ký tự, với giá trị dự phòng cho `narrow`. |

Các mask trong `std::ctype_base` gồm `alnum`, `alpha`, `blank`, `cntrl`, `digit`, `graph`, `lower`, `print`, `punct`, `space`, `upper`, `xdigit`; có thể kết hợp mask bằng `|`. `blank` được thêm từ C++11. Các kết quả cụ thể phụ thuộc locale và facet.

```cpp
#include <cassert>
#include <locale>
#include <string>

int main() {
    const std::locale loc = std::locale::classic();
    const auto& facet = std::use_facet<std::ctype<char>>(loc);
    assert(facet.is(std::ctype_base::alpha, 'a'));
    assert(facet.is(std::ctype_base::digit, '7'));
    std::string text("abc 123");
    facet.toupper(&text[0], &text[0] + text.size());
    assert(text == "ABC 123");
    const char* firstDigit = facet.scan_is(std::ctype_base::digit,
                                           text.data(), text.data() + text.size());
    assert(firstDigit != text.data() + text.size() && *firstDigit == '1');
}
```

Ví dụ dùng string không rỗng khi lấy `&text[0]`. Với UTF-8, xử lý từng `char` không tự phân loại hay đổi hoa thường theo ký tự Unicode; một ký tự tiếng Việt có thể gồm nhiều byte.

## Chuyển giữa `char` và `wchar_t`

`ctype<wchar_t>::widen` chuyển từng `char` sang `wchar_t`; `narrow` chuyển ngược từng ký tự hoặc dùng fallback nếu không có tương ứng. Các overload phạm vi yêu cầu bộ đệm đích đủ lớn. Đây là phép ánh xạ từng phần tử theo facet, **không phải** bộ giải mã UTF-8 nhiều byte tổng quát; không dùng để chuyển toàn bộ chuỗi UTF-8 tiếng Việt sang Unicode.

## Specialization `ctype<char>`

Sách mô tả `ctype<char>` dùng bảng mask để tối ưu phân loại: `table_size`, `classic_table()`, `table()` và constructor nhận bảng. Nếu truyền bảng với cờ quản lý bộ nhớ phù hợp, phải bảo đảm vòng đời bảng và cách cấp phát đúng với hợp đồng constructor; không truyền bảng cục bộ rồi để facet tồn tại lâu hơn bảng. Sách ghi nhầm rằng `table()` và `classic_table()` là protected ở đoạn sau, nhưng chính chú thích của sách cho biết chúng là public trong C++11.

## Hàm tiện ích và locale C

`std::isalpha(c, loc)`, `std::isdigit(c, loc)`, `std::isspace(c, loc)`, `std::toupper(c, loc)` và các hàm cùng nhóm trong `<locale>` gọi facet tương ứng của locale truyền vào. Kiểu đối số xác định specialization facet cần dùng; ví dụ truyền `char` để dùng `ctype<char>`.

Các overload một đối số trong `<cctype>` dùng C locale hiện hành và yêu cầu đối số là `EOF` hoặc giá trị biểu diễn được bằng `unsigned char`. Khi đầu vào là `char` có thể âm, chuyển sang `unsigned char` trước:

```cpp
#include <cassert>
#include <cctype>

int main() {
    char c = 'a';
    int upper = std::toupper(static_cast<unsigned char>(c));
    assert(upper == 'A');
}
```

Nếu phân loại nhiều ký tự theo cùng locale, có thể lấy facet một lần thay vì tra cứu lại trong vòng lặp. Hiệu năng thực tế phụ thuộc implementation và nên được đo khi cần.
