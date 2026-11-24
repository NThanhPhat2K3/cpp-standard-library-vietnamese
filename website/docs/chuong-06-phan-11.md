---
id: chuong-06-phan-11
title: 'Chương 6 · Hàm generic và remove–erase'
sidebar_label: '06 · Phần 11: Generic và remove–erase'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 6.6–6.7.1 · Hàm generic và xóa phần tử

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 216–221 (PDF trang 245–250). Các hộp ghi chú là phần bổ sung.

## 6.6 Hàm generic do người dùng viết

STL có thể mở rộng: ta có thể viết hàm và thuật toán riêng xử lý các tập hợp khác nhau. Ví dụ hàm trong sách in một tiền tố tùy chọn và mọi phần tử:

```cpp
#include <iostream>
#include <string>

template <typename T>
inline void PRINT_ELEMENTS(const T& coll, const std::string& prefix = "") {
    std::cout << prefix;
    for (const auto& elem : coll) std::cout << elem << ' ';
    std::cout << std::endl;
}
```

Có thể gọi `PRINT_ELEMENTS(coll, "all elements: ");`. Trước C++11, vòng lặp thường khai báo iterator tường minh:

```cpp
typename T::const_iterator pos;
for (pos = coll.begin(); pos != coll.end(); ++pos) {
    std::cout << *pos << ' ';
}
```

`typename` cho biết tên phụ thuộc `T::const_iterator` là một kiểu. Các container còn cung cấp những tên kiểu như `value_type`, hữu ích cho mã tổng quát; xem mục 9.5.1. Hàm này yêu cầu phần tử có thể xuất ra stream và tập hợp có giao diện duyệt phù hợp.

## 6.7 Thuật toán thay đổi dữ liệu

Container quản lý dữ liệu, iterator biểu diễn vị trí và thuật toán thao tác qua iterator. Thiết kế này linh hoạt nhưng có những hệ quả đáng chú ý khi thuật toán sửa hoặc “xóa” phần tử.

### 6.7.1 `std::remove` không thay đổi kích thước

Xét list trong sách:

```cpp
std::list<int> coll;
for (int i = 1; i <= 6; ++i) {
    coll.push_front(i);
    coll.push_back(i);
}
// 6 5 4 3 2 1 1 2 3 4 5 6

auto newEnd = std::remove(coll.begin(), coll.end(), 3);
```

`remove` dồn các giá trị không bị loại về đầu phạm vi và trả **điểm kết thúc logic mới**. Nó không gọi `erase` và không giảm `coll.size()`. Với ví dụ này, phạm vi `[coll.begin(), newEnd)` là:

```text
6 5 4 2 1 1 2 4 5 6
```

<figure className="book-figure">
  <img src={useBaseUrl('/img/remove-figure-6-10.png')} alt="Các giá trị không bằng 3 được dồn về phía đầu phạm vi bởi remove" />
  <figcaption>Hình 6.10 trong sách: cách remove dồn phần tử · trang 219 (PDF trang 248).</figcaption>
</figure>

Phần `[newEnd, coll.end())` vẫn gồm các đối tượng hợp lệ, nhưng giá trị của chúng không nên được xem là kết quả có ý nghĩa; chúng có thể ở trạng thái không xác định cụ thể sau các phép move. Sách in một đầu ra ví dụ có đuôi `5 6`, nhưng không nên phụ thuộc vào đuôi đó.

Có thể xử lý phạm vi logic hoặc đếm số phần tử ở đuôi:

```cpp
std::copy(coll.begin(), newEnd,
          std::ostream_iterator<int>(std::cout, " "));
auto removed = std::distance(newEnd, coll.end()); // 2
```

`std::distance` hoạt động với iterator list; không thể dùng `coll.end() - newEnd` vì iterator list không random access. Trong overload `std::copy` cổ điển, hai iterator của cùng phạm vi phải có kiểu tương thích theo chữ ký, vì vậy ví dụ dùng `begin()` cùng kiểu với `newEnd`.

Để thực sự giảm kích thước, gọi `erase` trên phần đuôi:

```cpp
coll.erase(newEnd, coll.end());
// hoặc gộp:
coll.erase(std::remove(coll.begin(), coll.end(), 3), coll.end());
```

Đây là idiom **erase–remove**. Thuật toán không gọi member `erase` vì nó chỉ nhận iterator, không nhất thiết biết container; phạm vi cũng có thể chỉ là một phần container hoặc thuộc một mảng không có `erase`. Nếu chỉ cần làm việc với phần còn lại, có thể giữ `newEnd` làm điểm cuối logic mà chưa xóa đuôi.

:::note Góc nhìn hiện đại
Với `std::list`, member `coll.remove(3)` trực tiếp xóa các node phù hợp và thường phù hợp hơn thuật toán dồn giá trị. Từ C++20, `std::erase(coll, 3)` là giao diện tiện lợi cho nhiều container; quy tắc cụ thể tùy container. Với container có khóa bất biến như `set`, không dùng `std::remove` để gán lại khóa — phần tiếp theo giải thích cách xóa.
:::
