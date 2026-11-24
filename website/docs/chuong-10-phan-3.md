---
id: chuong-10-phan-3
title: 'Chương 10 · Function object có sẵn và bind'
sidebar_label: '10 · Phần 3: Function object và bind'
---

# 10.2.1–10.2.2 · Function object có sẵn và `bind`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 486–491 (PDF trang 515–520). Ghi chú phiên bản và an toàn được bổ sung riêng.

## Function object trong `<functional>`

Bảng 10.1 của sách liệt kê các function object biểu diễn phép toán cơ bản:

| Nhóm | Function object và phép toán |
|:---|:---|
| Số học | `negate` (`-a`), `plus` (`a+b`), `minus` (`a-b`), `multiplies` (`a*b`), `divides` (`a/b`), `modulus` (`a%b`). |
| So sánh | `equal_to`, `not_equal_to`, `less`, `greater`, `less_equal`, `greater_equal` tương ứng `==`, `!=`, `<`, `>`, `<=`, `>=`. |
| Logic | `logical_not`, `logical_and`, `logical_or` tương ứng `!`, `&&`, `||`. |
| Bit | `bit_and`, `bit_or`, `bit_xor` tương ứng `&`, `|`, `^`. |

Ví dụ `std::plus<int>{}(2,3)` cho 5, `std::greater<int>{}(7,4)` cho `true`. Từ C++14, nhiều function object hỗ trợ dạng transparent như `std::plus<>`, suy ra kiểu đối số; sách viết theo C++11 nên thường chỉ định kiểu tường minh. Các phép toán vẫn có tiền điều kiện thông thường, ví dụ phép chia nguyên không được có mẫu bằng 0.

Comparator mặc định của associative container thường là `std::less<Key>`, còn predicate mặc định của unordered container là `std::equal_to<Key>`. Thứ tự và tương đương phụ thuộc comparator/predicate cụ thể; đối với chuỗi theo ngôn ngữ, sách giới thiệu cơ chế locale ở chương 16.

## `std::bind` và placeholder

`std::bind(callable, args...)` tạo callable mới. Giá trị cố định được lưu trong đối tượng bind; `_1`, `_2`, ... từ `std::placeholders` chọn đối số được truyền khi gọi callable mới. Các biểu thức bind lồng nhau cho phép kết hợp phép toán.

```cpp
#include <functional>
#include <iostream>

int main() {
    using namespace std::placeholders;
    auto plus10 = std::bind(std::plus<int>{}, _1, 10);
    auto plus10times2 = std::bind(std::multiplies<int>{},
                                  std::bind(std::plus<int>{}, _1, 10), 2);
    auto cube = std::bind(std::multiplies<int>{},
                          std::bind(std::multiplies<int>{}, _1, _1), _1);
    auto inverseDivide = std::bind(std::divides<double>{}, _2, _1);
    std::cout << plus10(7) << '\n'
              << plus10times2(7) << '\n'
              << cube(7) << '\n'
              << inverseDivide(49, 7) << '\n';
}
```

Kết quả lần lượt là `17`, `34`, `343`, khoảng `0.142857`: `_2, _1` đảo thứ tự, nên phép chia cuối là `7 / 49`. `std::bind(std::plus<int>{}, _1, 10)(32)` cho 42. Sách dùng các binder này với `std::transform` để cộng 10 hoặc `std::find_if` để tìm giá trị lớn hơn 42.

`std::bind` thường lưu bản sao đã decay của đối số cố định. Dùng `std::ref` hoặc `std::cref` khi muốn giữ tham chiếu, và bảo đảm đối tượng được tham chiếu còn sống khi callable được gọi:

```cpp
#include <cassert>
#include <functional>

void increment(int& value) { ++value; }
int main() {
    int value = 0;
    std::bind(increment, value)();           // tăng bản sao
    assert(value == 0);
    std::bind(increment, std::ref(value))(); // tăng bản gốc
    assert(value == 1);
}
```

## Gọi hàm tự do và hàm thành viên

Sách dùng `std::search` với predicate tạo từ `bind` lồng nhau để so sánh chữ hoa sau khi gọi một hàm `myToupper` cho từng ký tự. Lời gọi kết hợp có ý nghĩa `myToupper(a) == myToupper(b)`. Xử lý từng byte bằng locale không tự trở thành so sánh Unicode không phân biệt chữ hoa–thường.

`bind` cũng nhận con trỏ tới hàm thành viên: đối số được bind đầu tiên sau con trỏ xác định đối tượng nhận lời gọi. Ví dụ `std::bind(&Person::print, _1)` tạo callable gọi `print()` trên đối tượng đầu vào; có thể gắn thêm đối số cho hàm thành viên. `std::mem_fn` là adapter khác dành cho con trỏ thành viên.

Sách liệt kê `not1` và `not2` cho phép phủ định predicate trong C++11. Đây là các adapter cũ; mã hiện đại có thể dùng lambda hoặc `std::not_fn` từ C++17. Lambda thường dễ đọc hơn khi phép kết hợp phức tạp, nhưng lựa chọn phụ thuộc ngữ cảnh và yêu cầu phiên bản.
