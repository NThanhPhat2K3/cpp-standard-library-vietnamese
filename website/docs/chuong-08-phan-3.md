---
id: chuong-08-phan-3
title: 'Chương 8 · Truy cập phần tử và iterator'
sidebar_label: '08 · Phần 3: Truy cập và iterator'
---

# 8.5–8.6 · Truy cập phần tử và tạo iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 408–411 (PDF trang 437–440). Ghi chú bổ sung phân biệt các phiên bản và trường hợp đặc biệt.

## 8.5 Truy cập trực tiếp

### Theo chỉ số

`array`, `vector`, `deque` và `string` có `at(i)` cùng `operator[](i)` cho truy cập theo chỉ số. Có overload hằng và không hằng; kết quả thông thường là tham chiếu, riêng `vector<bool>` có proxy khi truy cập không hằng.

- `at(i)` kiểm tra giới hạn và ném `std::out_of_range` nếu `i >= size()`.
- Với `array`, `vector` và `deque`, `operator[]` yêu cầu `i < size()`; không được trông chờ vào ngoại lệ khi vi phạm tiền điều kiện.
- Với `std::string`, `s[s.size()]` là trường hợp đặc biệt từ C++11: truy cập ký tự kết thúc có giá trị `CharT()`, không phải phần tử trong phạm vi nội dung. Không ghi một giá trị khác `CharT()` vào vị trí đó; chỉ số lớn hơn `size()` không hợp lệ. `s.at(s.size())` vẫn ném.

Chỉ số thường có kiểu không dấu `size_type`; số âm được chuyển sang kiểu đó không trở thành một chỉ số hợp lệ. Tham chiếu trả về có thể mất hiệu lực khi container thay đổi hoặc cấp phát lại. `operator[]` có thể tránh chi phí kiểm tra của `at()`, nhưng hiệu năng thực tế phụ thuộc compiler và môi trường; quan trọng là chọn hợp đồng phù hợp.

### Theo khóa

`map` và `unordered_map` có `at(key)` và `operator[](key)`; các biến thể `multimap` không có giao diện này.

| Thao tác | Khóa có sẵn | Khóa chưa có |
|:---|:---|:---|
| `c.at(key)` | Trả tham chiếu tới mapped value; có overload `const`. | Ném `std::out_of_range`, không chèn. |
| `c[key]` | Trả tham chiếu tới mapped value. | Chèn phần tử mới với khóa tương ứng và mapped value được khởi tạo giá trị, rồi trả tham chiếu. |

`operator[]` chỉ có với map không hằng. Overload nhận rvalue key có thể move khóa khi cần chèn; không nên khẳng định giá trị đối tượng nguồn luôn bị thay đổi, đặc biệt khi khóa đã tồn tại và không cần chèn. Với allocator thông thường, mapped type phải có thể được khởi tạo mặc định cho phép chèn này. Từ C++17, `try_emplace` và `insert_or_assign` cung cấp các lựa chọn khác với ngữ nghĩa riêng.

### Phần tử đầu và cuối

`front()` có ở `array`, `vector`, `deque`, `list`, `forward_list` và `string`; `back()` có ở các nhóm đó trừ `forward_list`. Cả hai yêu cầu container không rỗng. Sách diễn đạt điều kiện bằng `size() > 0`, nhưng `forward_list` không có `size()`; dùng `!empty()` để kiểm tra khi thích hợp. Trong chương trình đa luồng, phải bảo đảm không có sửa đổi không đồng bộ giữa kiểm tra và truy cập.

### Vùng nhớ liên tục

`data()` của `array`, `vector<T>` thông thường và `string` trả con trỏ tới vùng ký tự/phần tử liên tục, thuận tiện khi gọi API nhận con trỏ và chiều dài. `vector<bool>` là chuyên biệt và không có hợp đồng vùng `bool` liên tục như vector thông thường. Với container rỗng, không dereference con trỏ khi không có phần tử.

Sách viết theo C++11 rằng `string::data()` chỉ có overload trả `const` pointer; từ C++17 có overload không `const`. Chuỗi có ký tự kết thúc ở `data()[size()]`; khi dùng API ghi, phải tuân thủ phạm vi ghi và quy tắc ký tự kết thúc, đồng thời bảo đảm không có reallocation làm con trỏ cũ mất hiệu lực.

## 8.6 Tạo iterator

| Container | Khả năng iterator theo bảng 8.1 |
|:---|:---|
| `array`, `vector`, `deque`, `string` | Random access. |
| `list` | Bidirectional. |
| `forward_list` | Forward. |
| `set`, `multiset` | Bidirectional; không sửa giá trị khóa qua iterator. |
| `map`, `multimap` | Bidirectional; khóa hằng, mapped value có thể sửa qua iterator không hằng. |
| Unordered set/multiset | Ít nhất forward; không sửa khóa qua iterator. |
| Unordered map/multimap | Ít nhất forward; khóa hằng, mapped value có thể sửa qua iterator không hằng. |

`begin()` và `end()` xác định phạm vi `[begin,end)`; khi rỗng hai iterator bằng nhau. `end()` là vị trí sau cuối và không được dereference. `cbegin()`/`cend()` cho const iterator từ C++11. Unordered container còn có overload `begin(i)`, `end(i)`, `cbegin(i)`, `cend(i)` để duyệt một bucket hợp lệ.

`rbegin()`/`rend()` tạo phạm vi duyệt ngược cho `array`, `vector`, `deque`, `list`, associative container có thứ tự và `string`; `crbegin()`/`crend()` là dạng chỉ đọc. Không dereference `rend()`. `forward_list` và unordered container không có các hàm thành viên reverse này.

```cpp
#include <iostream>
#include <vector>

int main() {
    const std::vector<int> values{1, 2, 3};
    for (auto it = values.cbegin(); it != values.cend(); ++it)
        std::cout << *it << ' '; // 1 2 3
    std::cout << '\n';
    for (auto it = values.crbegin(); it != values.crend(); ++it)
        std::cout << *it << ' '; // 3 2 1
    std::cout << '\n';
}
```

Sự hợp lệ của iterator phụ thuộc các thay đổi sau khi lấy nó: ví dụ vector reallocation hoặc unordered rehash làm iterator cũ mất hiệu lực. Chi tiết cho từng thao tác được trình bày ở các phần chèn và xóa tiếp theo.
