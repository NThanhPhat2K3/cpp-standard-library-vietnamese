---
id: chuong-06-phan-6
title: 'Chương 6 · Iterator và khoảng nửa mở'
sidebar_label: '06 · Phần 6: Iterator cơ bản'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.3 · Iterator và khoảng nửa mở

> **Phạm vi:** Phần mở đầu mục 6.3; ví dụ associative container và các nhóm iterator ở mục 6.3.1–6.3.2 sẽ tiếp tục sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 188–193 (PDF trang 217–222). Các hộp ghi chú là phần bổ sung.

## Iterator là gì?

Range-based `for` thuận tiện khi xử lý toàn bộ tập hợp, nhưng đôi khi ta cần tìm một phần tử, dừng giữa chừng hoặc lưu vị trí để tiếp tục sau. **Iterator** là đối tượng biểu diễn một vị trí và cho phép di chuyển qua các phần tử. Nó tạo giao diện chung cho nhiều cấu trúc container khác nhau, giúp các thuật toán generic hoạt động với những kiểu iterator đáp ứng yêu cầu.

Các thao tác cơ bản với iterator phù hợp:

- `*it`: truy cập phần tử tại vị trí hiện tại; `it->member` truy cập thành viên khi được hỗ trợ.
- `++it`: tiến tới vị trí tiếp theo; một số loại còn hỗ trợ `--it` để lùi.
- `==`, `!=`: so sánh vị trí khi phép so sánh được xác định.
- `it = other`: sao chép/gán vị trí theo khả năng của iterator.

Giao diện giống con trỏ dùng để duyệt mảng, nhưng iterator có thể là đối tượng với hành vi phù hợp cho danh sách, cây hoặc cấu trúc khác. Không phải mọi iterator đều có tất cả thao tác trên; các nhóm iterator sẽ được bàn ở mục 6.3.2.

## `begin()`, `end()` và `[begin, end)`

`begin()` cho vị trí phần tử đầu nếu container không rỗng. `end()` cho vị trí **ngay sau phần tử cuối** (*past-the-end*):

<figure className="book-figure">
  <img src={useBaseUrl('/img/iterator-range-figure-6-4.png')} alt="begin trỏ tới phần tử đầu và end biểu thị vị trí ngay sau phần tử cuối" />
  <figcaption>Hình 6.4 trong sách: begin() và end() · trang 189 (PDF trang 218).</figcaption>
</figure>

Phạm vi nửa mở `[begin, end)` bao gồm phần tử tại `begin` và mọi phần tử tiếp theo **kể cả phần tử cuối**, nhưng không bao gồm vị trí `end`. Điều này tạo điều kiện dừng đơn giản `it != end`; đồng thời với container rỗng, `begin() == end()` và vòng lặp không chạy. Câu chữ trong sách nói “loại trừ phần tử cuối” dễ gây hiểu nhầm: thứ bị loại trừ là **vị trí past-the-end**, không phải phần tử cuối.

:::warning Không giải tham chiếu end
`end()` không đại diện cho một phần tử có thể truy cập. Không dùng `*end()` hoặc `end()->member`; cũng không tăng một past-the-end iterator nếu hợp đồng iterator không cho phép.
:::

## Duyệt một list

```cpp
#include <iostream>
#include <list>

int main() {
    std::list<char> coll;
    for (char c = 'a'; c <= 'z'; ++c) coll.push_back(c);

    std::list<char>::const_iterator pos;
    for (pos = coll.begin(); pos != coll.end(); ++pos) {
        std::cout << *pos << ' ';
    }
    std::cout << '\n';
}
```

`pos` bắt đầu ở `begin`, tiến từng phần tử bằng `++pos` và dừng khi bằng `end`. Khi list rỗng, điều kiện sai ngay từ đầu. `*pos` lấy phần tử hiện tại.

<figure className="book-figure">
  <img src={useBaseUrl('/img/iterator-list-figure-6-5.png')} alt="Iterator pos di chuyển qua các node của danh sách liên kết" />
  <figcaption>Hình 6.5 trong sách: iterator duyệt list · trang 191 (PDF trang 220).</figcaption>
</figure>

Các container chuẩn thường cung cấp `iterator` và `const_iterator`. `const_iterator` không cho sửa phần tử qua iterator; `iterator` có thể cho phép sửa khi kiểu và container cho phép. Với `set`/`unordered_set`, khóa không được sửa trực tiếp qua iterator vì điều đó phá bất biến của container.

```cpp
// Với list<char>, có thể sửa qua iterator không const:
for (auto pos = coll.begin(); pos != coll.end(); ++pos) {
    *pos = static_cast<char>(std::toupper(static_cast<unsigned char>(*pos)));
}
```

Cần `<cctype>`; chuyển qua `unsigned char` tránh truyền giá trị `char` âm không hợp lệ cho `std::toupper` (trừ `EOF`). Với map, `pos->first` là khóa và `pos->second` là mapped value.

### `++pos` và `pos++`

Sách ưu tiên tiền tố `++pos`: hậu tố cần biểu diễn giá trị cũ và với một số iterator có thể tốn thêm công việc. Khi giá trị trả về bị bỏ qua, trình biên dịch thường tối ưu hai cách như nhau; không mặc định có chênh lệch hiệu năng đáng kể. Tính đúng và dễ đọc quan trọng hơn tối ưu phỏng đoán.

### `auto`, `cbegin()` và `cend()`

```cpp
for (auto pos = coll.begin(); pos != coll.end(); ++pos) {
    std::cout << *pos << ' ';
}
```

`auto` giúp không phải viết kiểu iterator dài và dễ thay loại container. Nhưng với container không const, `begin()` thường trả iterator có thể sửa. Khi chỉ đọc, C++11 cung cấp `cbegin()`/`cend()` để lấy const iterator:

```cpp
for (auto pos = coll.cbegin(); pos != coll.cend(); ++pos) {
    std::cout << *pos << ' ';
}
```

`const_iterator` hạn chế sửa **phần tử qua iterator**, không có nghĩa biến iterator tự nó là `const`; ta vẫn có thể tăng `pos`.

## Quan hệ với range-based `for`

Với container thông thường, ý tưởng của:

```cpp
for (const auto& elem : coll) {
    // xử lý elem
}
```

có thể hình dung như lấy begin và end, lặp `++pos`, rồi khởi tạo `elem` từ `*pos`. Dùng `const auto&` thường tránh sao chép khi chỉ đọc. Tuy vậy, đây là mô hình đơn giản: quy tắc thực tế của range-based `for` còn xử lý mảng, tra cứu `begin`/`end` và thời hạn sống theo phiên bản C++.

:::note Invalidation
Iterator có thể mất hiệu lực khi container bị sửa, tùy container và thao tác. Không lưu iterator qua `insert`, `erase`, `push_back` hoặc `rehash` mà không kiểm tra hợp đồng tương ứng.
:::
