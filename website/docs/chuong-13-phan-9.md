---
id: chuong-13-phan-9
title: 'Chương 13 · Tham khảo thao tác thay đổi string'
---

Phần này đối chiếu mục 13.3.7, trang 700–708. Trong các bảng, `s` là string đang sửa; vị trí chỉ số bằng `s.size()` có thể chỉ điểm sau phần tử cuối. Độ dài đoạn có thể lớn hơn phần còn lại và được giới hạn đến cuối string. Iterator và phạm vi phải hợp lệ, thuộc đúng đối tượng khi yêu cầu.

## Gán và trao đổi

| Cách gọi | Nội dung mới |
| --- | --- |
| `s = str`, `s.assign(str)` | Bản sao toàn bộ string; overload rvalue hỗ trợ move từ C++11. |
| `s.assign(str, pos, count)` | Tối đa `count` phần tử của `str` từ `pos`. |
| `s = cstr`, `s.assign(cstr)` | Nội dung C-string đến trước null đầu tiên. |
| `s.assign(chars, count)` | Đúng `count` phần tử mảng, kể cả null. |
| `s = ch`, `s.assign(count, ch)` | Một ký tự hoặc `count` bản sao. |
| `s.assign(first, last)` | Các phần tử trong phạm vi nửa mở. |
| `s = {a,b}`, `s.assign({a,b})` | Các ký tự trong initializer list, từ C++11. |

Các overload gán trả `string&` tới `s`; `pos > str.size()` ném `out_of_range`. Sau move, nguồn hợp lệ nhưng giá trị không xác định cụ thể. `s.swap(other)` và `std::swap(s, other)` trao đổi nội dung; cần xét yêu cầu allocator khi dùng allocator tùy biến.

## Thêm vào cuối

| Cách gọi | Ý nghĩa |
| --- | --- |
| `s += str`, `s.append(str)` | Thêm cả string. |
| `s.append(str, pos, count)` | Thêm đoạn nguồn, ném `out_of_range` nếu vị trí nguồn vượt kích thước. |
| `s += cstr`, `s.append(cstr)` | Thêm C-string. |
| `s.append(chars, count)` | Thêm đúng số phần tử mảng, kể cả null. |
| `s += ch`, `s.push_back(ch)` | Thêm một ký tự; `+=` trả `s`, `push_back` trả `void`. |
| `s.append(count, ch)` | Thêm các bản sao ký tự. |
| `s.append(first, last)` | Thêm phạm vi iterator. |
| `s += {a,b}`, `s.append({a,b})` | Thêm initializer list, từ C++11; trả `s`. |

:::note Đính chính chữ ký trong sách
Bảng sách ghi `append(initializer-list)` trả `void`, nhưng mô tả ngay sau đó lại nói trả `*this`. Overload này trả `basic_string&` trong C++11.
:::

## Chèn

Các overload theo chỉ số trả `string&`; phần mới bắt đầu tại chỉ số `pos` và các phần tử cũ từ đó dịch về sau. Chúng gồm `insert(pos, str)`, `insert(pos, str, source_pos, count)`, `insert(pos, cstr)`, `insert(pos, chars, count)` và `insert(pos, count, ch)`. Vị trí đích vượt `s.size()` hoặc vị trí nguồn vượt kích thước nguồn ném `out_of_range`.

Các overload theo iterator chèn **trước** vị trí truyền vào, gồm `insert(it, ch)`, `insert(it, count, ch)`, `insert(it, first, last)` và initializer list từ C++11. Trong giao diện C++11, chúng trả iterator tới phần tử đầu tiên được chèn, hoặc vị trí chèn khi không chèn phần tử; các overload nhiều phần tử dùng iterator không `const` và trả `void` trước C++11 theo sách. Iterator cũ có thể mất hiệu lực do thao tác sửa.

## Xóa và resize

| Cách gọi | Kết quả |
| --- | --- |
| `s.clear()` | Xóa toàn bộ; trả `void`. |
| `s.erase()` | Xóa toàn bộ; trả `s`. |
| `s.erase(pos, count)` | Xóa tối đa `count` phần tử từ `pos`, trả `s`; bỏ `count` để xóa đến hết. |
| `s.erase(it)`, `s.erase(first, last)` | Xóa một phần tử hoặc phạm vi; trả iterator hợp lệ tới phần tử ngay sau đoạn bị xóa, hoặc `end()` mới. |
| `s.pop_back()` | Xóa phần tử cuối; yêu cầu không rỗng, từ C++11. |
| `s.resize(n, ch)` | Đổi size thành `n`: cắt ở cuối hoặc thêm `ch`; bỏ `ch` dùng `charT()`. |

Dạng `erase` theo chỉ số ném `out_of_range` nếu `pos > size()`. `resize` và các thao tác làm tăng kích thước ném `length_error` nếu kích thước kết quả vượt `max_size()`; cấp phát cũng có thể thất bại. Không nhầm iterator trả về sau `erase` với iterator cũ đã có trước khi sửa.

## Thay thế

`replace(pos, count, source...)` thay tối đa `count` phần tử từ vị trí `pos`; `replace(first, last, source...)` thay phạm vi iterator. Nguồn có thể là toàn bộ string, C-string, mảng và độ dài, số bản sao ký tự, hoặc tùy overload là đoạn string, phạm vi iterator hay initializer list. Hàm trả `string&`; với dạng chỉ số, vị trí đích hoặc vị trí nguồn vượt kích thước tương ứng ném `out_of_range`.

```cpp
#include <cassert>
#include <string>

int main() {
    std::string s("abcde");
    s.insert(2, 3, 'X');             // abXXXcde
    s.erase(1, 2);                   // aXXcde
    s.replace(1, 2, "yz");         // ayzcde
    auto next = s.erase(s.begin(), s.begin() + 3);
    assert(s == "cde" && next == s.begin());
    s.resize(5, '!');                // cde!!
    assert(s == "cde!!");
}
```

Các overload C-string yêu cầu con trỏ hợp lệ và chuỗi kết thúc null; overload `(chars, count)` yêu cầu phạm vi đủ dài và xem null như dữ liệu. Không truyền con trỏ null hoặc iterator không hợp lệ. `npos` trong tham số **độ dài đoạn string** thường chỉ phần còn lại, nhưng không đại diện cho một mảng vô hạn hoặc số lượng ký tự lặp.

### Vị trí cuối và độ dài vượt phần còn lại

Các overload theo chỉ số phân biệt rõ vị trí bắt đầu với số ký tự yêu cầu. Vị trí bằng `size()` là hợp lệ; vị trí lớn hơn `size()` ném `std::out_of_range`. Khi vị trí hợp lệ, độ dài lớn hơn phần còn lại được giới hạn ở cuối chuỗi:

```cpp
#include <cassert>
#include <stdexcept>
#include <string>

int main() {
    const std::string source("abcdef");
    std::string value;
    value.assign(source, 4, 100);      // chỉ còn "ef"
    assert(value == "ef");
    value.insert(value.size(), "!"); // chèn tại cuối
    value.erase(value.size(), 100);   // xóa phạm vi rỗng
    assert(value == "ef!");

    bool caught = false;
    try {
        value.replace(value.size() + 1, 1, "x");
    } catch (const std::out_of_range&) {
        caught = true;
    }
    assert(caught && value == "ef!");
}
```

Nếu truyền vị trí và độ dài của cả chuỗi nguồn lẫn chuỗi đích, kiểm tra từng vị trí theo chuỗi tương ứng. Các quy tắc cắt độ dài nói trên không miễn yêu cầu vùng mảng hoặc iterator nguồn phải hợp lệ.
