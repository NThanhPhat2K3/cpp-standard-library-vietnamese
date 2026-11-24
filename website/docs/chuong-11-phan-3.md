---
id: chuong-11-phan-3
title: 'Chương 11 · for_each và đếm phần tử'
sidebar_label: '11 · Phần 3: for_each và count'
---

# 11.4–11.5.1 · `for_each`, `count`, `count_if`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 519–525 (PDF trang 548–554). Các ghi chú phiên bản và an toàn được thêm riêng.

## 11.4 `for_each`

Overload tuần tự `std::for_each(first,last,op)` gọi `op` cho từng phần tử của `[first,last)` và trả functor sau khi xử lý. Giá trị trả về của mỗi lời gọi `op` bị bỏ qua. Độ phức tạp tuyến tính, với một lời gọi cho mỗi phần tử; functor có thể sửa phần tử nếu iterator và callable cho phép.

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    std::for_each(values.cbegin(), values.cend(), [](int x) { std::cout << x << ' '; });
    std::cout << '\n';
    std::for_each(values.begin(), values.end(), [](int& x) { x += 10; });
    const int firstValue = values.front();
    std::for_each(values.begin(), values.end(), [firstValue](int& x) { x += firstValue; });
    for (int x : values) std::cout << x << ' ';
    std::cout << '\n';
}
```

Dòng đầu là `1 2 3 4 5 6 7 8 9`. Sau lần thêm 10, dãy là `11 12 13 14 15 16 17 18 19`; sau khi thêm bản sao giá trị đầu là 11, dãy là `22 23 24 25 26 27 28 29 30`.

Sách capture `[=]` và dùng `*coll.begin()` trong lambda: với biến vector cục bộ, cách đó sao chép **cả vector** vào closure, không chỉ sao chép phần tử đầu. Ở đây lưu riêng `firstValue` để biểu đạt cùng giá trị mà không copy cả container. Nếu capture `[&]` và đọc `*values.begin()` mỗi lần, lần gọi đầu làm giá trị đầu từ 11 thành 22, các phần tử sau cộng 22, cho `22 34 35 36 37 38 39 40 41`. Không đọc `front()` khi vector rỗng.

Một functor `AddValue<T>` lưu giá trị cần cộng là cách khác; `transform` có thể nhận hàm tạo giá trị mới và ghi vào đích thích hợp. Range-based for cũng thuận tiện khi xử lý từng phần tử. Với overload `for_each` dùng execution policy hoặc `ranges::for_each`, quy tắc và kiểu kết quả khác overload tuần tự trong sách.

### Lấy kết quả tích lũy

Sách dùng `MeanValue` đếm số phần tử và tổng trong `operator()`, rồi dùng functor được `for_each` trả về để tính trung bình. Với dãy 1–8, kết quả là 4.5. Mã đầy đủ và kiểm tra phạm vi rỗng đã được trình bày ở phần [function object và predicate](./chuong-10-phan-2.md). Cần lựa chọn kiểu tổng đủ lớn và không chia cho 0 khi dãy rỗng.

## 11.5.1 `count` và `count_if`

`std::count(first,last,value)` đếm phần tử bằng `value`; `std::count_if(first,last,pred)` đếm phần tử thỏa predicate. Hai hàm duyệt tuyến tính và trả kiểu `iterator_traits<It>::difference_type`. Predicate không được sửa đối số theo yêu cầu của thuật toán và không nên phụ thuộc vào số bản sao hoặc thứ tự gọi không được bảo đảm.

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    auto equal4 = std::count(values.cbegin(), values.cend(), 4);
    auto even = std::count_if(values.cbegin(), values.cend(), [](int x) { return x % 2 == 0; });
    auto above4 = std::count_if(values.cbegin(), values.cend(), [](int x) { return x > 4; });
    assert(equal4 == 1 && even == 4 && above4 == 5);
}
```

Trong associative hoặc unordered container, `c.count(key)` dùng chính sách tìm khóa của container và có thể hiệu quả hơn duyệt toàn bộ bằng thuật toán tổng quát; hai cách không nhất thiết dùng cùng tiêu chí tương đương. Sách cũng minh họa predicate số chẵn bằng `bind` hoặc adapter cũ; lambda ở trên diễn đạt trực tiếp hơn.
