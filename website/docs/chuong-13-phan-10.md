---
id: chuong-13-phan-10
title: 'Chương 13 · Tham khảo tìm kiếm, I/O và allocator'
---

Phần này đối chiếu các mục 13.3.8–13.3.13, trang 708–716. Các ví dụ dùng giao diện C++11 được sách trình bày.

## Tìm kiếm theo giá trị hoặc tập ký tự

`find` và `rfind` tìm ký tự hoặc chuỗi con; các hàm `find_first_of`, `find_first_not_of`, `find_last_of`, `find_last_not_of` tìm một ký tự thuộc hoặc không thuộc tập cho trước. Tất cả trả `size_type`, hoặc `npos` nếu không tìm thấy. Chúng có overload nhận string, C-string, một ký tự, hoặc con trỏ mảng với vị trí tìm và độ dài mảng. Giá trị null bên trong mảng có độ dài là dữ liệu; C-string cần con trỏ hợp lệ và null kết thúc.

Với tìm xuôi, vị trí là nơi bắt đầu tìm; với tìm ngược, đó là giới hạn trên của chỉ số được xét. Đặc biệt, mẫu rỗng có quy tắc riêng: `find("", pos)` thành công tại `pos` nếu `pos <= size()`, còn `rfind("")` mặc định trả `size()`.

```cpp
#include <cassert>
#include <string>

int main() {
    const std::string s("ababa");
    assert(s.find("ba") == 1);
    assert(s.rfind("ba", 2) == 1);
    assert(s.find_first_of("xyb") == 1);
    assert(s.find_last_not_of("ab") == std::string::npos);
    assert(s.find("", s.size()) == s.size());
    assert(s.rfind("") == s.size());
    const char pattern[] = {'b', '\0'};
    assert(s.find(pattern, 0, 2) == std::string::npos);
}
```

Các `_of` và `_not_of` xét từng phần tử trong tập, không tìm chuỗi con. Chi tiết các hàm và ví dụ khác nằm ở [phần tìm kiếm](./chuong-13-phan-5.md).

## Chuỗi con và nối

`substr(pos, count)` trả string mới chứa tối đa `count` phần tử từ `pos`; mặc định `pos = 0` và `count = npos`. `pos == size()` hợp lệ, cho string rỗng; `pos > size()` ném `out_of_range`. `operator+` tạo chuỗi nối string với string, C-string hoặc ký tự trong các tổ hợp được hỗ trợ, và có overload rvalue từ C++11. Vượt kích thước tối đa ném `length_error`; đối tượng được move vẫn hợp lệ nhưng giá trị sau đó không xác định cụ thể.

## Nhập xuất

`operator<<` ghi nội dung string; nếu `width()` lớn hơn độ dài, stream có thể thêm ký tự đệm theo thiết lập, rồi đặt width về 0. `operator>>` đọc token, bỏ khoảng trắng đầu nếu bật `skipws` và dừng tại khoảng trắng theo locale, giới hạn width, hết khả năng đọc hoặc `max_size()`. Width được đặt lại về 0 sau phép trích xuất.

`std::getline(stream, s, delim)` đọc cả khoảng trắng đầu đến dấu phân cách, EOF hoặc giới hạn; dấu phân cách được lấy khỏi stream nhưng không đưa vào string. Mặc định dấu phân cách là newline đã được stream widen. Cả `getline` và các thao tác stream có hỗ trợ rvalue stream trong C++11. Khi không đọc được dữ liệu như yêu cầu, kiểm tra trạng thái stream; các cờ trạng thái cũng có thể gây ngoại lệ nếu đã cấu hình exception mask.

## Chuyển số

`stoi`, `stol`, `stoll`, `stoul`, `stoull` nhận string hoặc wstring, con trỏ tùy chọn đến vị trí đầu chưa xử lý, và cơ số tùy chọn. `stof`, `stod`, `stold` nhận string hoặc wstring và con trỏ vị trí tùy chọn, **không nhận đối số cơ số**. Nếu không có số hợp lệ, hàm ném `invalid_argument`; nếu ngoài miền biểu diễn, ném `out_of_range`. `to_string` và `to_wstring` tạo chuỗi từ số.

:::note Đính chính chữ ký trong sách
Bảng trang 713 in kiểu trả về `int` cho tất cả hàm và in thêm `base` cho hàm số thực. Kiểu trả về đúng lần lượt là `int`, `long`, `long long`, `unsigned long`, `unsigned long long`, `float`, `double`, `long double` theo tên hàm; chỉ nhóm chuyển số nguyên nhận `base`.
:::

## Iterator

`begin/end` tạo phạm vi xuôi `[begin, end)`; `rbegin/rend` tạo phạm vi ngược. Các hàm `cbegin/cend/crbegin/crend` trả iterator chỉ đọc từ C++11. Khi chuỗi rỗng, `begin() == end()` và `rbegin() == rend()`; không dereference iterator kết thúc. Dù có thể đọc ký tự kết thúc qua `s[s.size()]`, điều đó không làm `*s.end()` hợp lệ.

## Allocator

`allocator_type` là tham số template allocator của `basic_string`; với `std::string` thông thường là `std::allocator<char>`. `get_allocator()` trả bản sao allocator hiện dùng. Có các overload constructor nhận allocator cho chuỗi rỗng, sao chép hoặc move, chuỗi con, C-string, mảng có độ dài, ký tự lặp, phạm vi iterator và initializer list; những overload copy có allocator, move và initializer list được sách nêu là có từ C++11.

Khi sao chép, lựa chọn allocator phụ thuộc overload và quy tắc allocator của phiên bản chuẩn; không mặc định rằng luôn sao chép nguyên xi allocator nguồn. Chi tiết về allocator, propagation và hành vi khi các allocator khác nhau được bàn ở chương 19.
