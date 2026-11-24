---
id: chuong-13-phan-4
title: 'Chương 13 · Thay đổi, nối và nhập xuất string'
---

Phần này theo mục 13.2.8–13.2.10, trang 673–678 của sách. Các đoạn ví dụ dưới đây là những câu lệnh đặt trong hàm, với `#include <string>` và các header tương ứng.

## Gán và trao đổi

`operator=` nhận một string, C-string hợp lệ hoặc một ký tự. `assign()` có thêm overload nhận đoạn string, mảng có độ dài, số bản sao của ký tự, hay một dải iterator:

```cpp
const std::string source("othello");
std::string s;
s = source;                         // "othello"
s = "two\nlines";                   // C-string
s = ' ';                            // một ký tự
s.assign(source, 1, 3);             // "the"
s.assign(source, 2, std::string::npos); // "hello"
s.assign("nico", 5);                // gồm cả ký tự null cuối literal
s.assign(5, 'x');                   // "xxxxx"
```

`swap()` trao đổi giá trị hai string; có cả hàm `std::swap`. Lưu ý các điều kiện liên quan allocator khi dùng allocator tùy biến. Để làm rỗng chuỗi, có thể dùng `s = ""`, `s.clear()` hoặc `s.erase()`.

## Thêm và chèn

`+=` nối string, C-string, một ký tự hoặc initializer list (C++11). `append()` hỗ trợ thêm các overload chỉ định đoạn, mảng và độ dài, số bản sao hoặc phạm vi iterator. `push_back()` thêm một ký tự và cho phép dùng back inserter với thuật toán STL.

```cpp
const std::string source("othello");
std::string s;
s += source;
s += '\n';
s += {'o', 'k'};           // C++11
s.append(source, 1, 3);    // thêm "the"
s.append("nico", 5);       // thêm cả null
s.append(5, 'x');          // thêm năm 'x'
s.push_back('!');
```

`insert(pos, value)` chèn **trước phần tử hiện tại ở chỉ số `pos`**; `pos == size()` chèn vào cuối. Các overload khác nhận vị trí iterator:

```cpp
std::string s("p");
s.insert(1, "age");       // "page"
s.insert(1, "ersifl");    // "persiflage"
s.insert(std::string::size_type(0), 1, ' '); // thêm một dấu cách
s.insert(s.begin(), '!');  // chèn một ký tự qua iterator
```

Overload theo chỉ số để chèn ký tự lặp cần cả số lượng và ký tự; `s.insert(0, ' ')` không phải cách gọi đó. Sách cảnh báo `insert(0, 1, ' ')` có thể mơ hồ trong một số implementation cũ khi iterator là kiểu con trỏ: `0` có thể là chỉ số hoặc hằng con trỏ null. Dùng `std::string::size_type(0)` thể hiện rõ ý định, hoặc dùng overload iterator.

## Xóa, thay và đổi kích thước

`erase()` xóa theo chỉ số hoặc iterator; `replace()` thay đoạn bởi nội dung mới. `pop_back()` (C++11) xóa phần tử cuối và yêu cầu string không rỗng.

```cpp
std::string s = "i18n";
s.replace(1, 2, "nternationalizatio"); // "internationalization"
s.erase(13);                             // "international"
s.erase(7, 5);                           // "internal"
s.pop_back();                            // "interna"
s.replace(0, 2, "ex");                 // "externa"
```

`resize(n)` cắt bớt cuối chuỗi khi `n` nhỏ hơn size, hoặc thêm ký tự mặc định `charT()` khi `n` lớn hơn size. `resize(n, ch)` dùng `ch` cho các phần tử mới. Với `std::string`, ký tự mặc định là `\0` và được tính trong size.

## Trích chuỗi con và nối

```cpp
std::string s("interchangeability");
std::string all = s.substr();          // bản sao toàn bộ
std::string tail = s.substr(11);       // "ability"
std::string part = s.substr(5, 6);     // "change"
std::string found = s.substr(s.find('c')); // "changeability"
```

Nếu tìm kiếm có thể thất bại, kiểm tra `find()` khác `npos` trước khi đưa vào `substr()` làm vị trí. `operator+` nối string với string, C-string hoặc ký tự trong các tổ hợp có overload phù hợp. Ví dụ sau tạo `internationalization`:

```cpp
std::string s1("enter"), s2("nation");
std::string result = 'i' + s1.substr(1) + s2 + "aliz" + s2.substr(1);
```

Từ C++11, các overload `operator+` hỗ trợ rvalue và có thể tận dụng move. Chỉ dùng `std::move` khi đồng ý rằng đối tượng nguồn vẫn hợp lệ nhưng giá trị sau đó không xác định cụ thể; move không đảm bảo sẽ tránh mọi cấp phát.

## Đọc và ghi qua stream

`operator>>` đọc một token: mặc định bỏ khoảng trắng đầu theo cờ `skipws`, rồi đọc đến khoảng trắng theo locale, trạng thái stream không còn cho phép đọc, giới hạn `width()` dương hoặc `max_size()`. Sau thao tác, width được đặt lại về 0. `operator<<` ghi nội dung và có xét độ rộng để căn đệm khi cần.

`std::getline(stream, s)` đọc đến newline hoặc hết dữ liệu, bao gồm cả khoảng trắng đầu; dấu phân cách được lấy khỏi stream nhưng không thêm vào `s`. Có thể truyền dấu khác làm đối số thứ ba:

```cpp
#include <iostream>
#include <string>

int main() {
    std::string token;
    while (std::getline(std::cin, token, ':')) {
        std::cout << '[' << token << "]\n";
    }
}
```

Khi phân cách bằng `':'`, newline là dữ liệu thông thường và có thể nằm trong token. Từ C++11, các overload hỗ trợ rvalue stream, ví dụ `std::getline(std::stringstream(contents), firstLine)` sau khi include `<sstream>`. Có thể gọi `getline` không ghi `std::` nhờ argument-dependent lookup, nhưng ghi rõ `std::getline` giúp dễ đọc.
