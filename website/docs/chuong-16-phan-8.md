---
id: chuong-16-phan-8
title: 'Chương 16 · Chuyển đổi mã hóa với codecvt'
---

Phần này theo mục 16.4.4, trang 897–903. Các API dưới đây phản ánh C++11 của sách; nhiều tiện ích chuyển mã Unicode này đã bị phản đối trong C++17 và một số bị loại khỏi C++26, nên cần kiểm tra phiên bản và thư viện khi bảo trì mã.

## Facet `codecvt`

`std::codecvt<InternT, ExternT, StateT>` chuyển giữa biểu diễn nội bộ và bên ngoài, với đối tượng state để lưu thông tin cần thiết giữa các lần chuyển đổi. Ví dụ, `basic_filebuf` sử dụng facet tương ứng từ locale của nó. Một code unit có kích thước cố định không có nghĩa mỗi ký tự Unicode chỉ dùng một code unit.

| Thành viên | Công dụng |
| --- | --- |
| `in` | Chuyển từ dãy `ExternT` sang dãy `InternT`. |
| `out` | Chuyển từ dãy `InternT` sang dãy `ExternT`. |
| `unshift` | Ghi chuỗi cần thiết để kết thúc trạng thái chuyển đổi. |
| `encoding` | Cho biết chuyển đổi phụ thuộc state, độ dài biến đổi hay độ dài cố định. |
| `always_noconv` | Cho biết facet không cần chuyển đổi. |
| `length`, `max_length` | Hỗ trợ tính lượng input và kích thước cần thiết. |

`in` và `out` nhận hai phạm vi nguồn/đích cùng state; các con trỏ `from_next`, `to_next` cho biết đã tiêu thụ và tạo bao nhiêu phần tử. Kết quả là `ok`, `partial`, `error` hoặc `noconv`. `partial` có thể do thiếu input để hoàn tất một ký tự hoặc thiếu chỗ ở đích; phải xét cả kết quả lẫn các con trỏ và state trước khi tiếp tục. `noconv` không có nghĩa đích tự chứa bản sao dữ liệu.

Khi nhận `partial`, phần nguồn chưa được tiêu thụ bắt đầu tại `from_next`; dữ liệu đã tạo nằm trước `to_next`. Nếu đích đã đầy, cấp thêm chỗ trước khi tiếp tục. Nếu nguồn đã hết nhưng state còn thông tin về một chuỗi chưa hoàn tất, cần cung cấp thêm input và giữ state đó. Ở cuối input thực sự, chuỗi còn dang dở phải được xử lý theo chính sách lỗi của ứng dụng. Không lặp vô hạn với cùng đầu vào, cùng buffer và không có tiến triển.

`encoding()` trả `-1` cho chuyển đổi phụ thuộc trạng thái, `0` cho độ dài ngoài biến đổi, hoặc số code unit bên ngoài cố định cho mỗi đơn vị nội bộ. `unshift()` tạo các byte cần thiết để kết thúc trạng thái chuyển đổi; `partial` ở đây nghĩa là cần thêm chỗ để ghi phần kết thúc. `length()` cho biết số phần tử nguồn ngoài có thể tiêu thụ để tạo tối đa số phần tử nội bộ yêu cầu, không phải số ký tự Unicode hiển thị.

Ví dụ sau kiểm tra trường hợp không chuyển đổi của facet `char` trong locale C. Khi nhận `noconv`, nguồn vẫn cần được xử lý trực tiếp; không đọc buffer đích như thể `in()` đã sao chép nó:

```cpp
#include <cassert>
#include <codecvt>
#include <cwchar>
#include <locale>

int main() {
    const std::locale loc = std::locale::classic();
    const auto& facet = std::use_facet<
        std::codecvt<char, char, std::mbstate_t>>(loc);
    std::mbstate_t state{};
    const char source[] = "abc";
    const char* from_next = nullptr;
    char output[3] = {};
    char* to_next = nullptr;
    const auto result = facet.in(state, source, source + 3, from_next,
                                 output, output + 3, to_next);
    assert(result == std::codecvt_base::noconv);
    assert(from_next == source && to_next == output);
}
```

Hành vi không chuyển đổi ở đây thuộc facet của `locale::classic()`; không suy ra mọi facet `codecvt<char, char, ...>` trong mọi locale đều giống vậy.

:::note Đính chính sách
Trang 898 mô tả ngược kiểu nguồn và đích trong phần `in`, và trang 899 cũng đảo tên con trỏ của `out`. `in` nhận nguồn `ExternT` và ghi `InternT`; `out` nhận nguồn `InternT` và ghi `ExternT`. Phép chuyển giữa `wchar_t` và byte không nhất thiết là tách hoặc ghép trực tiếp các byte biểu diễn `wchar_t`; nó phụ thuộc facet và locale.
:::

## Các facet Unicode trong C++11

Header `<codecvt>` của C++11 cung cấp `codecvt_utf8`, `codecvt_utf16` và `codecvt_utf8_utf16`, với tham số kiểu phần tử nội bộ, giới hạn code point và các cờ như `consume_header`, `generate_header`, `little_endian`. Cần chọn facet phù hợp với việc nội dung nội bộ là UTF-16 code units hay giá trị code point; không giả định `wchar_t` có cùng kích thước trên mọi nền tảng.

`wstring_convert` bọc facet và cung cấp `from_bytes`/`to_bytes` cho string hoặc phạm vi. Ví dụ C++11 sau chuyển giữa UTF-8 và UTF-16, kể cả ký tự ngoài BMP:

```cpp
#include <cassert>
#include <codecvt>
#include <locale>
#include <string>

int main() {
    const std::string utf8("\xE2\x82\xAC\xF0\x9F\x98\x80", 7);
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
    std::u16string utf16 = convert.from_bytes(utf8);
    assert(utf16.size() == 3); // euro và một cặp surrogate
    assert(convert.to_bytes(utf16) == utf8);
}
```

Cách xử lý dữ liệu không hợp lệ hoặc chưa hoàn tất cần được kiểm tra theo hợp đồng của lớp và chính sách ứng dụng; chuyển mã thành công không đồng nghĩa văn bản đã được chuẩn hóa hoặc sẵn sàng cho mọi phép so sánh.

## Chuyển mã qua stream buffer

`wbuffer_convert` trong C++11 kết hợp stream buffer byte bên dưới với facet để stream bên trên xử lý ký tự rộng. Sách minh họa đọc UTF-8 rồi ghi UTF-16 có BOM bằng hai buffer chuyển đổi. Buffer gốc phải tồn tại đủ lâu, đồng thời cần kiểm tra lỗi và flush đầu ra. Vì độ rộng `wchar_t`, các facet khả dụng và tình trạng API thay đổi theo môi trường/phiên bản, ví dụ sách là tài liệu về giao diện C++11, không phải bảo đảm chuyển được mọi ký tự trên mọi hệ thống.
