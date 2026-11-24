---
id: chuong-13-phan-8
title: 'Chương 13 · Tham khảo constructor và compare'
---

Phần này đối chiếu mục 13.3.2–13.3.6, trang 694–700, với các phần tổng quan trước. Ở đây `string` đại diện một specialization `basic_string` với kiểu ký tự tương ứng.

## Constructor: điều kiện và kết quả

| Dạng | Nội dung và điều kiện |
| --- | --- |
| `string()` | Tạo chuỗi rỗng. |
| `string(str)` | Sao chép nội dung của `str`. |
| `string(std::move(str))` | Chuyển nội dung; nguồn còn hợp lệ, giá trị sau move không xác định cụ thể. Từ C++11. |
| `string(str, pos, count)` | Lấy tối đa `count` phần tử từ `pos`; mặc định lấy đến hết. Ném `out_of_range` nếu `pos > str.size()`. |
| `string(cstr)` | Lấy tới trước null đầu tiên; yêu cầu C-string hợp lệ. |
| `string(chars, count)` | Lấy đúng `count` phần tử trong phạm vi hợp lệ, kể cả null. |
| `string(count, ch)` | Tạo `count` bản sao của `ch`. |
| `string(first, last)` | Tạo từ phạm vi input iterator hợp lệ `[first, last)`. |
| `string({a, b, ...})` | Tạo từ initializer list, từ C++11. |

Nếu kích thước kết quả vượt `max_size()`, các thao tác tạo hoặc mở rộng tương ứng ném `std::length_error`; cấp phát bộ nhớ cũng có thể thất bại. Các constructor thường có overload nhận allocator, xem mục 13.3.13. Destructor hủy đối tượng và giải phóng tài nguyên sở hữu.

```cpp
#include <cassert>
#include <stdexcept>
#include <string>

int main() {
    std::string source("abc");
    assert(std::string(source, 3).empty()); // pos == size hợp lệ
    try {
        std::string invalid(source, 4);
        assert(false);
    } catch (const std::out_of_range&) {}
    const char bytes[] = {'a', '\0', 'b'};
    std::string binary(bytes, 3);
    assert(binary.size() == 3 && binary[2] == 'b');
}
```

Không truyền con trỏ null hoặc phạm vi mảng không hợp lệ để đánh cược vào một ngoại lệ; điều kiện của overload phải được đáp ứng trước. Giá trị `npos` là một số rất lớn, không phải “đến hết” trong constructor `(chars, count)` hay `(count, ch)`.

## Size và capacity

`size()` và `length()` tương đương; `empty()` kiểm tra rỗng; `max_size()` cho giới hạn kích thước; `capacity()` cho dung lượng trước khi cần cấp phát lại. `reserve(n)` yêu cầu capacity ít nhất `n`; `shrink_to_fit()` từ C++11 yêu cầu thu nhỏ nhưng không bắt buộc implementation thực hiện. Hai thao tác có thể ảnh hưởng tính hợp lệ của tham chiếu và iterator. Sự khác nhau giữa hành vi `reserve` trong sách và từ C++20 đã được ghi ở [phần size và capacity](./chuong-13-phan-3.md).

## Các overload `compare`

`compare` so sánh từ điển theo traits, trả số âm, 0 hoặc dương. Các toán tử `==`, `!=`, `<`, `>`, `<=`, `>=` hỗ trợ hai string hoặc string với C-string hợp lệ theo từng thứ tự toán hạng trong giao diện sách mô tả.

| Dạng | Hai vế được so sánh |
| --- | --- |
| `s.compare(str)` | Toàn bộ `s` và `str`. |
| `s.compare(pos, count, str)` | Đoạn của `s` với toàn bộ `str`. |
| `s.compare(pos, count, str, pos2, count2)` | Đoạn của `s` với đoạn của `str`. |
| `s.compare(cstr)` | Toàn bộ `s` với C-string. |
| `s.compare(pos, count, cstr)` | Đoạn của `s` với C-string. |
| `s.compare(pos, count, chars, len)` | Đoạn của `s` với đúng `len` phần tử của mảng hợp lệ. |

Độ dài đoạn string được giới hạn bởi số phần tử còn lại; vị trí vượt `size()` của string tương ứng ném `out_of_range`. Trong overload mảng có độ dài, null là dữ liệu, không phải dấu kết thúc; phạm vi được yêu cầu phải hợp lệ. Việc so sánh phụ thuộc `traits::compare`, không tự dùng quy tắc sắp xếp ngôn ngữ tự nhiên.

```cpp
#include <cassert>
#include <string>

int main() {
    const std::string s("abcd"), t("xxbcyy");
    assert(s.compare(1, 2, t, 2, 2) == 0); // bc == bc
    assert(s.compare(0, 2, "ac") < 0);     // ab < ac
    const char bytes[] = {'b', 'c', '\0'};
    assert(s.compare(1, 2, bytes, 2) == 0);
}
```

## Truy cập và sao chép ra mảng

`operator[]` không kiểm tra phạm vi như `at()`. Trong C++11, có thể đọc ký tự kết thúc tại `s[s.size()]`; `at(s.size())` ném `out_of_range`. `front()` và `back()` yêu cầu không rỗng. Sách ghi `front()` trên chuỗi rỗng trả null, nhưng điều này không đáp ứng điều kiện tiên quyết của `front()`; xem đính chính ở phần trước.

`c_str()` và `data()` cho quyền truy cập dãy do string sở hữu; với C++11, dãy có phần tử kết thúc ở `size()`. Con trỏ có thể mất hiệu lực khi string bị sửa hoặc hủy. `copy(buf, count, pos)` trả số phần tử được sao chép, không tự thêm null, ném `out_of_range` nếu `pos > size()`, và yêu cầu bộ đệm đủ lớn. Nếu cần C-string, người gọi phải chừa chỗ và tự thêm null.

### Null bên trong string và bản sao ra mảng

Một `std::string` có thể chứa null ở giữa mà vẫn còn ký tự phía sau. Khi dùng overload nhận C-string, việc diễn giải dừng ở null đầu; overload nhận con trỏ và độ dài xử lý đủ số phần tử:

```cpp
#include <cassert>
#include <string>

int main() {
    const char source[] = {'a', '\0', 'b', '\0'};
    const std::string text(source, 3);
    assert(text.size() == 3);
    assert(text.compare(source) > 0);       // C-string source chỉ là "a"
    assert(text.compare(0, text.size(), source, 3) == 0);

    char destination[4] = {};
    const std::size_t copied = text.copy(destination, 3);
    assert(copied == 3 && destination[1] == '\0' && destination[2] == 'b');
    destination[copied] = '\0'; // chủ động thêm terminator sau dữ liệu
}
```

Dù đã thêm terminator cuối mảng, một hàm C nhận C-string vẫn chỉ thấy `"a"` vì null ở giữa. Nếu cần chuyển cả ba byte, phải dùng API chấp nhận **cả con trỏ và độ dài**; không thể khôi phục phần sau null từ riêng một C-string.
